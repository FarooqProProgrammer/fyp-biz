import DashboardLayout from '@/Layout/Provider/DashboardLayout'
import React, { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import Cookies from 'js-cookie'
import {jwtDecode} from 'jwt-decode'

// Define the columns for the data table
const columns = [
  {
    name: 'ID',
    selector: row => row.id,
    sortable: true,
    width: '80px',
  },
  {
    name: 'Service',
    selector: row => row.service,
    sortable: true,
  },
  {
    name: 'Forecast',
    selector: row => row.forecast,
    sortable: true,
  },
  {
    name: 'Date',
    selector: row => row.date,
    sortable: true,
  },
  {
    name: 'Day',
    selector: row => row.day,
    sortable: true,
  },
]

// Fallback sample data for the table
const sampleData = [
  { id: 1, service: 'Service A', forecast: 120, date: '2025-01-06', day: 'Monday' },
  { id: 2, service: 'Service A', forecast: 125, date: '2025-01-07', day: 'Tuesday' },
  { id: 3, service: 'Service B', forecast: 140, date: '2025-01-06', day: 'Monday' },
  { id: 4, service: 'Service B', forecast: 138, date: '2025-01-07', day: 'Tuesday' },
]

const Prediction = () => {
  const [tableData, setTableData] = useState([])

  useEffect(() => {
    // Retrieve the token from cookies (assuming cookie name is "token")
    const token = Cookies.get('token')
    if (token) {
      try {
        const decoded = jwtDecode(token)
        console.log("Decoded JWT token:", decoded)
        console.log("User _id:", decoded.id)
      } catch (error) {
        console.error("Error decoding JWT token:", error)
      }
    } else {
      console.log("No token found in cookies")
    }

    // Call the API endpoint with email as query parameter
    fetch("http://127.0.0.1:5000/predict?email=client@example.com")
      .then((res) => res.json())
      .then((result) => {
        console.log("API response:", result)
       
      })
      .catch((error) => console.error("Error fetching API:", error))
  }, [])

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Prediction Data Table</h1>
        <DataTable
          title="Forecast Data"
          columns={columns}
          data={tableData.length ? tableData : sampleData}
          pagination
          highlightOnHover
          pointerOnHover
          responsive
        />
      </div>
    </DashboardLayout>
  )
}

export default Prediction
