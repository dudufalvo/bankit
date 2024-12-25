import './home.css'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { LineChart } from 'components/LineChart';
import TablePagination from '@mui/material/TablePagination';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

type SoilDataType = {
  soil_data_id: string,
  moisture: string,
  date: string,
  time: string,
  node: string
}

type FetchDataType = {
  soil_data_id: string,
  moisture: string,
  timestamp: string,
  node: string
}

const converTimeStamp = (timestamp: string) => {
  // split time stamp in date and time
  const date = timestamp.split('T')[0];
  const time = timestamp.split('T')[1].split('.')[0];
  return {date, time};
}

const Home = () => {
  const [data, setData] = useState<SoilDataType[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event: unknown, newPage: number) => {
    console.log(event);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const convertMoisture = (moistureValue: number) => {
    // Fixar os valores maiores que 550 em 550
    if (moistureValue > 550) {
      moistureValue = 550;
    }
  
    // Defina os limites da escala original
    const minOriginal = 0;
    const maxOriginal = 550;
  
    // Defina os limites da escala desejada (0% a 100%)
    const minDesired = 100;
    const maxDesired = 0;
  
    // Mapeamento linear dos valores de umidade
    const moisturePercent = ((moistureValue - minOriginal) * (maxDesired - minDesired)) / (maxOriginal - minOriginal) + minDesired;
  
    // Limitar o valor para ficar entre 0% e 100%
    return Math.max(0, Math.min(100, moisturePercent)).toFixed(2);
  };

  useEffect(() => {
    axios.get('https://soilsense.pythonanywhere.com/api/soil-data')
    .then((response) => {
      const data = response.data;
      const soilData = data.map((item: FetchDataType) => {
        const {date, time} = converTimeStamp(item.timestamp);
        const moistureValue = parseInt(item.moisture, 10);
        const moisturePercent = convertMoisture(moistureValue).toString() + '%';
        return {
          soil_data_id: item.soil_data_id,
          moisture: moisturePercent,
          date: date,
          time: time,
          node: item.node
        }
      });
      soilData?.reverse();
      setData(soilData);
    }
    )
    .catch((error) => {
      console.log(error);
    });
  }
  , []);

  return (
    <div className='main'>
      <div className='table'>
        <span>Dashboard</span>
        <div className='flex'>
          <div><LineChart/></div>

          <>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 700 }} aria-label="customized table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Soil Data (ID)</StyledTableCell>
                    <StyledTableCell align="right">Moisture</StyledTableCell>
                    <StyledTableCell align="right">Date</StyledTableCell>
                    <StyledTableCell align="right">Time</StyledTableCell>
                    <StyledTableCell align="right">Node (ID)</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <StyledTableRow key={row.soil_data_id}>
                      <StyledTableCell component="th" scope="row">
                        {row.soil_data_id}
                      </StyledTableCell>
                      <StyledTableCell align="right">{row.moisture}</StyledTableCell>
                      <StyledTableCell align="right">{row.date}</StyledTableCell>
                      <StyledTableCell align="right">{row.time}</StyledTableCell>
                      <StyledTableCell align="right">{row.node}</StyledTableCell>
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
    </div>
  )
}

export default Home
