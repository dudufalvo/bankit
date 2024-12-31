import json
import time
import boto3
from botocore.exceptions import ClientError

from django.http import JsonResponse
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication


s3 = boto3.resource('s3', region_name='us-east-1')
s3_client = boto3.client('s3', region_name='us-east-1')
rekognition = boto3.client('rekognition', region_name='us-east-1')
dynamodb = boto3.client('dynamodb', region_name='us-east-1')
stepfunctions_client = boto3.client('stepfunctions', region_name='us-east-1')

S3_BUCKET_NAME = 'bankit-user-images'
SM_ARN = "arn:aws:states:us-east-1:533267126312:stateMachine:MyStateMachine-CalculateCreditScore"
SM_ARN_DECISION = "arn:aws:states:us-east-1:533267126312:stateMachine:MyStateMachine-NotifyClientAboutManagerDecision"


def get_user_from_jwt(request):
  jwt_authenticator = JWTAuthentication()

  try:
    user, _ = jwt_authenticator.authenticate(request)
    return user
  except AuthenticationFailed as e:
    raise AuthenticationFailed(str(e))


def search_face_in_dynamodb(uploaded_image_path):
  with open(uploaded_image_path, 'rb') as target_image_file:
    response = rekognition.search_faces_by_image(
      CollectionId='famouspersons',
      Image={'Bytes': target_image_file.read()},
      FaceMatchThreshold=80,
      MaxFaces=1
    )

  if 'FaceMatches' in response and len(response['FaceMatches']) > 0:
    face_id = response['FaceMatches'][0]['Face']['FaceId']
    confidence = response['FaceMatches'][0]['Similarity']

    if confidence > 80:
      dynamo_response = dynamodb.get_item(
        TableName='face_recognition',
        Key={'RekognitionId': {'S': face_id}}
      )

      if 'Item' in dynamo_response:
        full_name = dynamo_response['Item']['FullName']['S']
        return True, full_name
      else:
        return False, None
  return False, None


def upload_image_to_s3_and_dynamodb(tmp_file_path, email):
  with open(tmp_file_path, 'rb') as file:
    object = s3.Object(S3_BUCKET_NAME, f'index/{tmp_file_path}')
    object.put(
      Body=file,
      Metadata={'FullName': email}
    )

  dynamodb.put_item(
    TableName='face_recognition',
    Item={
      'RekognitionId': {'S': email},
      'FullName': {'S': email},
    }
  )


def get_presigned_url_from_s3_and_dynamodb(email, expiration=3600):
  try:
    dynamo_response = dynamodb.get_item(
      TableName='face_recognition',
      Key={'RekognitionId': {'S': email}}
    )

    if 'Item' not in dynamo_response:
      return JsonResponse({"error": "Image not found in the database"}, status=404)

    object_key = f"index/{email}.png"
    print(object_key)

    presigned_url = s3_client.generate_presigned_url(
      'get_object',
      Params={'Bucket': S3_BUCKET_NAME, 'Key': object_key},
      ExpiresIn=expiration
    )
    return presigned_url

  except ClientError as e:
    return JsonResponse({"error": str(e)}, status=500)


def run_step_function_ccs(input_payload):
  try:
    response = stepfunctions_client.start_execution(
      stateMachineArn=SM_ARN,
      input=json.dumps(input_payload)
    )
    execution_arn = response["executionArn"]
    print(f"Execution started with ARN: {execution_arn}")

    data = {}
    while True:
      describe_response = stepfunctions_client.describe_execution(
        executionArn=execution_arn
      )

      status = describe_response['status']
      if status == 'SUCCEEDED':
        output = json.loads(describe_response['output'])
        data = {
          "status": 200,
          "executionArn": execution_arn,
          "credit_score": output['results'][0]['credit_score'],
          "decision": output['results'][0]['decision'],
          "startDate": response["startDate"]
        }
        return data
      elif status == 'FAILED' or status == 'TIMED_OUT' or status == 'CANCELLED':
        data = {
          "status": 500,
          "message": f"Execution {status}",
          "executionArn": execution_arn
        }
        return
      else:
        time.sleep(5)

      return data

  except ClientError as e:
    return {
      "status": "error",
      "message": str(e)
    }
  except Exception as e:
    return {
      "status": "error",
      "message": "An unexpected error occurred: " + str(e)
    }


def run_step_function_notify_decision(input_payload):
  try:
    response = stepfunctions_client.start_execution(
      stateMachineArn=SM_ARN_DECISION,
      input=json.dumps(input_payload)
    )
    execution_arn = response["executionArn"]
    print(f"Execution started with ARN: {execution_arn}")

    return response

  except ClientError as e:
    return JsonResponse({"error": str(e)}, status=500)