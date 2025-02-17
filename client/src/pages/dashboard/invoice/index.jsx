import React, { useEffect, useState } from "react";
import AddInvoice from "@/components/AddInvoice";
import DashboardLayout from "@/Layout/Provider/DashboardLayout";
import apiClient from "@/lib/axios";
import DataTable from "react-data-table-component";
import { EditIcon, Trash2Icon } from "lucide-react";

const customStyles = {
  headRow: {
    style: {
      backgroundColor: "#F9FAFB",
      borderBottom: "1px solid #E5E7EB",
    },
  },
  headCells: {
    style: {
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "#4B5563",
      paddingLeft: "1rem",
      paddingRight: "1rem",
    },
  },
  cells: {
    style: {
      paddingLeft: "1rem",
      paddingRight: "1rem",
    },
  },
};

const Invoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInvoices = async () => {
    try {
      const response = await apiClient.get("/invoice");
      setInvoices(response.data.invoices);
    } catch (err) {
      setError("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;

    try {
      await apiClient.delete(`/invoice/${id}`);
      setInvoices((prev) => prev.filter((invoice) => invoice._id !== id));
    } catch (err) {
      alert("Failed to delete invoice");
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "50px",
    },
    {
      name: "Invoice Number",
      selector: (row) => row.invoiceNumber,
      sortable: true,
    },
    {
      name: "Date",
      selector: (row) => new Date(row.invoiceDate).toLocaleDateString(),
      sortable: true,
    },
    {
      name: "Amount",
      selector: (row) => `$${row.invoiceAmount}`,
      sortable: true,
    },
    {
      name: "Client",
      selector: (row) => row.clientId?.name || "N/A",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button className="text-blue-500 hover:text-blue-700">
            <EditIcon />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2Icon />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];



  return (
    <DashboardLayout>
      <div className="flex justify-end items-center py-3">
        <AddInvoice onInvoiceAdded={fetchInvoices} />
      </div>

      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Invoices</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <DataTable
            columns={columns}
            data={invoices}
            customStyles={customStyles}
            pagination
            highlightOnHover
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Invoice;
