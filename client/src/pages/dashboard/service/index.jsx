import React, { useState } from 'react';
import { useRouter } from 'next/router';
import DataTable from 'react-data-table-component';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Download, Filter, Edit, Trash2 } from 'lucide-react';
import DashboardLayout from '@/Layout/Provider/DashboardLayout';
import { useDeleteCustomerMutation, useDeleteServiceMutation, useGetAllServiceQuery } from '@/redux/services/apiSlice';
import { toast } from '@/hooks/use-toast';
import AddService from '@/components/AddService';
import UpdateService from '@/components/UpdateService';

const Customer = () => {
    const [filterText, setFilterText] = useState('');
    const { data: services, isLoading } = useGetAllServiceQuery();
    const [deletemutation] = useDeleteServiceMutation();

    // Update modal state
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    const columns = [
        {
            name: 'Id',
            selector: row => row.index,
            sortable: true,
        },
        {
            name: 'Service Name',
            selector: row => row.serviceName,
            sortable: true,
        },
        {
            name: 'Created At',
            selector: row => row.createdAt,
            sortable: true,
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="flex items-center gap-2">
                    <Button onClick={() => handleEdit(row)} variant="ghost" size="icon" className="hover:bg-gray-100">
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleDelete(row?.id)} variant="ghost" size="icon" className="hover:bg-red-100 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ),
        },
    ];

    // Open update modal with selected service data
    const handleEdit = (service) => {
        setSelectedService(service);
        setIsUpdateModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this service?")) {
            try {
                await deletemutation({ id }).unwrap();
                toast({
                    title: "Service Deleted",
                    description: "Success",
                });
            } catch (error) {
                console.error("Error deleting service:", error);
                toast({
                    title: "Service Delete",
                    description: "Error",
                    variant: "destructive",
                });
            }
        }
    };

    const customerData = services?.service?.map((service, index) => ({
        index: index + 1,
        id: service._id,
        serviceName: service.serviceName,
        createdAt: new Date(service.createdAt).toLocaleDateString(),
    })) || [];

    const filteredData = customerData.filter(
        item => item.serviceName.toLowerCase().includes(filterText.toLowerCase())
    );

    return (
        <DashboardLayout>
            <Card className="shadow-sm">
                <CardHeader className="border-b bg-white">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <CardTitle>Service Management</CardTitle>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search services..."
                                    value={filterText}
                                    onChange={e => setFilterText(e.target.value)}
                                    className="pl-9 w-full sm:w-[300px]"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" className="flex items-center gap-2">
                                    <Filter className="w-4 h-4" />
                                    Filter
                                </Button>
                                <Button variant="outline" className="flex items-center gap-2">
                                    <Download className="w-4 h-4" />
                                    Export
                                </Button>
                                <AddService />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <DataTable
                        columns={columns}
                        data={filteredData}
                        pagination
                        highlightOnHover
                        pointerOnHover
                        responsive
                        progressPending={isLoading}
                    />
                </CardContent>
            </Card>

            {/* Update Service Modal */}
            {selectedService && (
                <UpdateService 
                    open={isUpdateModalOpen} 
                    onClose={() => setIsUpdateModalOpen(false)} 
                    service={selectedService} 
                />
            )}
        </DashboardLayout>
    );
};

export default Customer;
