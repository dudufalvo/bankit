import styles from './node.module.scss'
import axios from 'axios'
import toast from 'utils/toast'
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useEffect, useState } from 'react'
import TablePagination from '@mui/material/TablePagination';
import { MultiValue, SingleValue } from 'react-select';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import SelectDropdown from 'components/SelectDropdown';
import Button from 'components/Button';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  stacked: false,
  plugins: {
    title: {
      display: true,
      text: 'Humidity Levels',
    },
  },
  scales: {
    y: {
      type: 'linear' as const,
      display: true,
      position: 'left' as const,
    },
    y1: {
      type: 'linear' as const,
      display: true,
      position: 'right' as const,
      grid: {
        drawOnChartArea: false,
      },
    },
  },
};

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

type NodeRequestType = {
  node_id: string;
  central: number;
}

type SoilDataType = {
  soil_data_id: string,
  moisture: number,
  sensor_id: number,
  date: string,
  time: string,
  latitude: number,
  longitude: number,
  battery: number,
  node: string
}

type FetchDataType = {
  soil_data_id: string,
  moisture: number,
  sensor_id: number,
  timestamp: string,
  latitude: number,
  longitude: number,
  battery: number,
  node: string
}

export type DropdownOptionType = {
  value: string,
  image?: string | React.ReactNode,
  label: string,
  id?: number,
  handle?: () => void
}

const converTimeStamp = (timestamp: string) => {
  // split time stamp in date and time
  const date = timestamp.split('T')[0];
  const time = timestamp.split('T')[1].split('.')[0];
  return {date, time};
}

const Node = ({ node_id }: NodeRequestType) => {
  const [data, setData] = useState<SoilDataType[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [stats, setStats] = useState<any>();
  const [selectedDate, setSelectedDate] = useState<DropdownOptionType>({ label: 'Last Records', value: 'last_ten_data' });
  const [isIrrigating, setIsIrrigating] = useState(false);

  const handleChangePage = (event: unknown, newPage: number) => {
    console.log(event);
    setPage(newPage);
  };

  const handleIrrigation = () => {

    if (isIrrigating) {
      axios.post(`https://eu1.cloud.thethings.network/api/v3/as/applications/soilsense-lora-app/devices/${node_id}/down/push`, { "downlinks": [{"f_port": 2, "frm_payload": 'AA==', "priority": 'NORMAL'}] }, { headers: { 'Authorization': `Bearer NNSXS.FMQQ4WHARZVAEBZ6JIXOZPPM2556CICX2YXBZJQ.KVEG536BTX62TJ4FQTCHKGRNIBFSSHUBDRLUGMJMIZBZ3EGQBFJQ`, 'Content-Type': 'application/json'}})
      .then(() => {
        toast.success('Irrigation stopped successfully');
        setIsIrrigating(false);
      })
      .catch(() => {
        toast.error('Failed to stop irrigation');
      });

      setIsIrrigating(false);
      return;
    }

    axios.post(`https://eu1.cloud.thethings.network/api/v3/as/applications/soilsense-lora-app/devices/${node_id}/down/push`, { "downlinks": [{"f_port": 2, "frm_payload": 'AQ==', "priority": 'NORMAL'}] }, { headers: { 'Authorization': `Bearer NNSXS.FMQQ4WHARZVAEBZ6JIXOZPPM2556CICX2YXBZJQ.KVEG536BTX62TJ4FQTCHKGRNIBFSSHUBDRLUGMJMIZBZ3EGQBFJQ`, 'Content-Type': 'application/json'}})
    .then(() => {
      toast.success('Irrigation started successfully');
    })
    .catch(() => {
      toast.error('Failed to start irrigation');
    });

    setIsIrrigating(true);
  }

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

  const handleSelectedDate = (value: SingleValue<DropdownOptionType> | MultiValue<DropdownOptionType>) => {
    if (!value) return
    const filteredDate = value as DropdownOptionType

    setSelectedDate(filteredDate)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/soil-data/node/${node_id}/`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
    .then((response) => {
      const data = response.data;

      const soilData = data.map((item: FetchDataType) => {
        const {date, time} = converTimeStamp(item.timestamp);
        const moisturePercent = convertMoisture(item.moisture).toString() + '%';
        return {
          soil_data_id: item.soil_data_id,
          moisture: moisturePercent,
          sensor_id: item.sensor_id,
          date: date,
          time: time,
          latitude: item.latitude,
          longitude: item.longitude,
          battery: item.battery,
          node: item.node
        }
      }
      );

      soilData?.reverse();

      setData(soilData);
    }
    )
    .catch((error) => {
      console.log(error);
    });
  }
  , []);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/node-stats/${node_id}/${selectedDate?.value}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
    .then((response) => {
      const data = response.data;
      console.log(data);

      if (selectedDate?.value !== 'day') {
        data?.period?.reverse();
        data?.average_moisture?.reverse();
      }

      const stats = {
        labels: data.period,
        datasets: [
          {
            label: 'Average Moisture',
            data: data?.average_moisture?.map((item: number) => { return convertMoisture(item) }),
            borderColor: 'rgb(135, 178, 114)',
            backgroundColor: 'rgba(135, 178, 114, 0.5)',
            yAxisID: 'y',
          }
        ],
      }

      setStats(stats);
    }
    )
    .catch((error) => {
      console.log(error);
    });
  }
  , [selectedDate]);

  const filters = [
    { label: 'Last Records', value: 'last_ten_data' },
    { label: 'Hour', value: 'hour' },
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Year', value: 'year' }
  ]

  return (
    <div className={styles.main}>
      <div className={styles.flex2}>
        <h2>{`${node_id.toUpperCase()}`}</h2>
        <Button children={<span>{isIrrigating ? 'Stop Irrigation': 'Start Irrigation'}</span>} handle={handleIrrigation} variant={isIrrigating ? 'red' : 'filled'} />
      </div>

      <div className={styles.flex}>
        <div>
        <SelectDropdown type='select' sendOptionsToParent={handleSelectedDate} /* defaultOption={dataOptions[0]} */ options={filters} label='Filter' name='date' />
        {stats && <div><Line data={stats} options={options} /></div>}
        </div>

      <>
        <TableContainer component={Paper} key={node_id}>
          <Table sx={{ minWidth: 700 }} aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell>Soil Data ID</StyledTableCell>
                <StyledTableCell align="right">Sensor ID</StyledTableCell>
                <StyledTableCell align="right">Date</StyledTableCell>
                <StyledTableCell align="right">Time</StyledTableCell>
                <StyledTableCell align="right">Latitude</StyledTableCell>
                <StyledTableCell align="right">Longitude</StyledTableCell>
                <StyledTableCell align="right">Battery</StyledTableCell>
                <StyledTableCell align="right">Moisture</StyledTableCell>
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
                  <StyledTableCell align="right">{row.sensor_id}</StyledTableCell>
                  <StyledTableCell align="right">{row.date}</StyledTableCell>
                  <StyledTableCell align="right">{row.time}</StyledTableCell>
                  <StyledTableCell align="right">{row.latitude}</StyledTableCell>
                  <StyledTableCell align="right">{row.longitude}</StyledTableCell>
                  <StyledTableCell align="right">{`${row.battery}.00%`}</StyledTableCell>
                  <StyledTableCell align="right">{row.moisture}</StyledTableCell>
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
  )
}

export default Node