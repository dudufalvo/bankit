import './home.css'
import Paper from '@mui/material/Paper'
import { styled } from '@mui/material/styles'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell, { tableCellClasses } from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import axios from 'axios'
import { useEffect, useState } from 'react'

import Button from 'components/Button'
import { ScheduleModal } from 'components/Modals'
import { useUser } from 'contexts/userContext'
import toast from 'utils/toast'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}))


type LoanRequestsType = {
  id: number
  requester: string
  manager: string
  interest_rate: number
  amount: number
  duration: number
  monthly_payment: number
  credit_score: number
  model_decision: string
  status: string
}

type InterviewRequestType = {
  id: number
  loan_request: number
  requester: string
  manager: string
  date: string
  initial_time: string
  end_time: string
  model_decision: string
  ocurred: boolean
}


const Home = () => {
  const [page, setPage] = useState(0)
  const [open, setOpen] = useState<boolean>(false)
  const [loanId, setLoanId] = useState<number>(-1)
  const [interviewPage, setInterviewPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [interviewRowsPerPage, setInterviewRowsPerPage] = useState(5)
  const [data, setData] = useState<LoanRequestsType[]>([])
  const [interviews, setInterviews] = useState<InterviewRequestType[]>([])

  const { user } = useUser()

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeIPage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const handleChangeIRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInterviewRowsPerPage(+event.target.value)
    setInterviewPage(0)
  }

  const handleInterview = (id: number) => {
    setLoanId(id)
    setOpen(true)
  }


  useEffect(() => { 
    if (user?.is_manager) {
      axios.get(`${import.meta.env.VITE_API_BASE_URL}/manager/list-loan-requests`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      .then(response => {
        setData(response.data)
        toast.success('Loans fetched sucessfully!')
      })
      .catch(() => {
        toast.error('Failed to fetch loans!')
      })

      axios.get(`${import.meta.env.VITE_API_BASE_URL}/manager/list-interviews`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      .then(response => {
        setInterviews(response.data)
        toast.success('Interviews fetched sucessfully!')
      })
      .catch(() => {
        toast.error('Failed to fetch interview data!')
      })
    }

    else {
      axios.get(`${import.meta.env.VITE_API_BASE_URL}/client/list-loan-requests`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      .then(response => {
        setData(response.data)
        toast.success('Data fetched sucessfully!')
      })
      .catch(() => {
        toast.error('Failed to fetch data!')
      })

      axios.get(`${import.meta.env.VITE_API_BASE_URL}/client/list-interviews`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      .then(response => {
        setInterviews(response.data)
        toast.success('Interviews fetched sucessfully!')
      })
      .catch(() => {
        toast.error('Failed to fetch interview data!')
      })
    }
  }, [user])


  return (
    <div className='main'>
      { user?.is_manager && 
        <>
          <div className='table'>
            <span>Loan Requests</span>
            <div className='flex'>
              <>
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 700 }} aria-label="customized table">
                    <TableHead>
                      <TableRow>
                        <StyledTableCell>Loan Request (ID)</StyledTableCell>
                        <StyledTableCell align="right">Requester</StyledTableCell>
                        <StyledTableCell align="right">Interest Rate</StyledTableCell>
                        <StyledTableCell align="right">Amount</StyledTableCell>
                        <StyledTableCell align="right">Duration</StyledTableCell>
                        <StyledTableCell align="right">Monthly Payment</StyledTableCell>
                        <StyledTableCell align="right">Credit Score</StyledTableCell>
                        <StyledTableCell align="right">Model Decision</StyledTableCell>
                        <StyledTableCell align="right">Final Decision</StyledTableCell>
                        <StyledTableCell align="right">Manager</StyledTableCell>
                        <StyledTableCell align="right"></StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map(row => (
                        <StyledTableRow key={row.id}>
                          <StyledTableCell component="th" scope="row">
                            {row.id}
                          </StyledTableCell>
                          <StyledTableCell align="right">{row.requester}</StyledTableCell>
                          <StyledTableCell align="right">{row.interest_rate}</StyledTableCell>
                          <StyledTableCell align="right">{row.amount}</StyledTableCell>
                          <StyledTableCell align="right">{row.duration}</StyledTableCell>
                          <StyledTableCell align="right">{row.monthly_payment}</StyledTableCell>
                          <StyledTableCell align="right">{row.credit_score}</StyledTableCell>
                          <StyledTableCell align="right">{row.model_decision}</StyledTableCell>
                          <StyledTableCell align="right">{row.status}</StyledTableCell>
                          <StyledTableCell align="right">{row.manager}</StyledTableCell>
                          <StyledTableCell align="right">
                            {
                            /* eslint-disable-next-line no-inline-styles/no-inline-styles */
                            row.status === 'waiting' && <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <Button></Button>
                              <Button handle={() => handleInterview(row.id)} variant='blue'></Button>
                              <Button variant='red'></Button>
                            </div>
                            }
                          </StyledTableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                <ScheduleModal isOpen={open} loan_id={loanId} handleClosing={() => setOpen(false)} />
                </TableContainer>
                <TablePagination
                  page={page}
                  component="div"
                  count={data.length}
                  rowsPerPage={rowsPerPage}
                  onPageChange={handleChangePage}
                  rowsPerPageOptions={[5, 10, 25]}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            </div>
          </div>
          <div className='table'>
            <span>Interviews</span>
            <div className='flex'>
              <>
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 700 }} aria-label="customized table">
                    <TableHead>
                      <TableRow>
                        <StyledTableCell>Interview (ID)</StyledTableCell>
                        <StyledTableCell align="right">Loan Request (ID)</StyledTableCell>
                        <StyledTableCell align="right">Requester</StyledTableCell>
                        <StyledTableCell align="right">Date</StyledTableCell>
                        <StyledTableCell align="right">Initial Time</StyledTableCell>
                        <StyledTableCell align="right">End Time</StyledTableCell>
                        <StyledTableCell align="right">Model Decision</StyledTableCell>
                        <StyledTableCell align="right">Ocurred</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {interviews
                      .slice(interviewPage * interviewRowsPerPage, interviewPage * interviewRowsPerPage + interviewRowsPerPage)
                        .map(row => (
                          <StyledTableRow key={row.id}>
                            <StyledTableCell component="th" scope="row">
                              {row.id}
                            </StyledTableCell>
                            <StyledTableCell align="right">{row.loan_request}</StyledTableCell>
                            <StyledTableCell align="right">{row.requester}</StyledTableCell>
                            <StyledTableCell align="right">{row.date}</StyledTableCell>
                            <StyledTableCell align="right">{row.initial_time}</StyledTableCell>
                            <StyledTableCell align="right">{row.end_time}</StyledTableCell>
                            <StyledTableCell align="right">{row.model_decision}</StyledTableCell>
                            <StyledTableCell align="right">{row.ocurred}</StyledTableCell>
                          </StyledTableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  page={interviewPage}
                  component="div"
                  count={interviews.length}
                  rowsPerPage={interviewRowsPerPage}
                  onPageChange={handleChangeIPage}
                  rowsPerPageOptions={[5, 10, 25]}
                  onRowsPerPageChange={handleChangeIRowsPerPage}
                />
              </>
            </div>
          </div>
        </>
      }
      { !user?.is_manager &&
        <>
          <div className='table'>
            <span>Loan Requests</span>
            <div className='flex'>
              <>
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 700 }} aria-label="customized table">
                    <TableHead>
                      <TableRow>
                        <StyledTableCell>Loan Request (ID)</StyledTableCell>
                        <StyledTableCell align="right">Requester</StyledTableCell>
                        <StyledTableCell align="right">Interest Rate</StyledTableCell>
                        <StyledTableCell align="right">Amount</StyledTableCell>
                        <StyledTableCell align="right">Duration</StyledTableCell>
                        <StyledTableCell align="right">Monthly Payment</StyledTableCell>
                        <StyledTableCell align="right">Credit Score</StyledTableCell>
                        <StyledTableCell align="right">Model Decision</StyledTableCell>
                        <StyledTableCell align="right">Final Decision</StyledTableCell>
                        <StyledTableCell align="right">Manager</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map(row => (
                          <StyledTableRow key={row.id}>
                            <StyledTableCell component="th" scope="row">
                              {row.id}
                            </StyledTableCell>
                            <StyledTableCell align="right">{row.requester}</StyledTableCell>
                            <StyledTableCell align="right">{row.interest_rate}</StyledTableCell>
                            <StyledTableCell align="right">{row.amount}</StyledTableCell>
                            <StyledTableCell align="right">{row.duration}</StyledTableCell>
                            <StyledTableCell align="right">{row.monthly_payment}</StyledTableCell>
                            <StyledTableCell align="right">{row.credit_score}</StyledTableCell>
                            <StyledTableCell align="right">{row.model_decision}</StyledTableCell>
                            <StyledTableCell align="right">{row.status}</StyledTableCell>
                            <StyledTableCell align="right">{row.manager}</StyledTableCell>
                          </StyledTableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={data.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            </div>
          </div>
          <div className='table'>
            <span>Interviews</span>
            <div className='flex'>
              <>
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 700 }} aria-label="customized table">
                    <TableHead>
                      <TableRow>
                        <StyledTableCell>Interview (ID)</StyledTableCell>
                        <StyledTableCell align="right">Loan Request (ID)</StyledTableCell>
                        <StyledTableCell align="right">Manager</StyledTableCell>
                        <StyledTableCell align="right">Date</StyledTableCell>
                        <StyledTableCell align="right">Initial Time</StyledTableCell>
                        <StyledTableCell align="right">End Time</StyledTableCell>
                        <StyledTableCell align="right">Model Decision</StyledTableCell>
                        <StyledTableCell align="right">Ocurred</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {interviews
                      .slice(interviewPage * interviewRowsPerPage, interviewPage * interviewRowsPerPage + interviewRowsPerPage)
                        .map(row => (
                          <StyledTableRow key={row.id}>
                            <StyledTableCell component="th" scope="row">
                              {row.id}
                            </StyledTableCell>
                            <StyledTableCell align="right">{row.loan_request}</StyledTableCell>
                            <StyledTableCell align="right">{row.manager}</StyledTableCell>
                            <StyledTableCell align="right">{row.date}</StyledTableCell>
                            <StyledTableCell align="right">{row.initial_time}</StyledTableCell>
                            <StyledTableCell align="right">{row.end_time}</StyledTableCell>
                            <StyledTableCell align="right">{row.model_decision}</StyledTableCell>
                            <StyledTableCell align="right">{row.ocurred ? 'yes' : 'no'}</StyledTableCell>
                          </StyledTableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  page={interviewPage}
                  component="div"
                  count={interviews.length}
                  rowsPerPage={interviewRowsPerPage}
                  onPageChange={handleChangeIPage}
                  rowsPerPageOptions={[5, 10, 25]}
                  onRowsPerPageChange={handleChangeIRowsPerPage}
                />
              </>
            </div>
          </div>
        </>
      }
    </div>
  )
}

export default Home
