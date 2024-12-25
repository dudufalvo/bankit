import styles from './centralform.module.scss'
import InputText from 'components/Form/InputText'
import { FormProvider, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import Button from 'components/Button'
import * as yup from 'yup'
import axios from 'axios'
import toast from 'utils/toast'
import { useEffect, useState } from 'react'
import Node from 'components/Node'

type CentralFormProps = {
  central_id: number,
  name: string,
  latitude: number,
  longitude: number,
}

type NodeType = {
  node_id: string;
}

type NodeRequestType = {
  node_id: string;
  central: number;
}

const validationSchema = yup.object().shape({
  node_id: yup.string().required('Name is required')
})


const CentralForm = ({ central_id }: CentralFormProps) => {
  const [data, setData] = useState<NodeRequestType[]>([]);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/node/central/${central_id}/`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
    .then((response) => {
      const data = response.data;
      setData(data);
    }
    )
    .catch((error) => {
      console.log(error);
    });
  }
  , []);

  const methods = useForm<NodeType>({
    resolver: yupResolver(validationSchema)
  })

  const handleSendMessage = (requestData: NodeType) => {

    const data: NodeRequestType = {
      node_id: requestData.node_id,
      central: central_id
    }

    axios.post(`${import.meta.env.VITE_API_BASE_URL}/node/create`, { data }, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`}})
      .then(() => {
        toast.success('Node added successfully')
      })
      .catch(() => {
        toast.error('Failed to add node to central')
      })
  }

  return (
    <div className={styles.main}>
      <div className={styles.table}>
        <div className={styles.forms}>
          <FormProvider {...methods}>
            <form className={styles.reviewModal}>
              <InputText label='NodeID' name='node_id' id='node_id' placeholder="Enter the node id" isRequired={true} />
              <Button type='submit' variant='filled' fullWidth handle={methods.handleSubmit(handleSendMessage)}>Add Node</Button>
            </form>
          </FormProvider>
        </div>

        {
          data.length > 0 ? data?.map((node) => (
            <Node key={node.node_id} node_id={node.node_id} central={central_id} />
          )) : <div className={styles.nofound}>No nodes found</div>
        }
      </div>
    </div>
  )
}

export default CentralForm