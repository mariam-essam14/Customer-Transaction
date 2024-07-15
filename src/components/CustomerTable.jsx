
import React, { useMemo, useState } from 'react';
import {
    MRT_TableBodyCellValue,
    MRT_TablePagination,
    MRT_ToolbarAlertBanner,
    flexRender,
    useMaterialReactTable,
} from 'material-react-table';
import {
    Box,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    Container,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const HighlightText = ({ text, highlight }) => {
    if (!highlight.trim()) {
        return <span >{text}</span>;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
        <span>
            {parts.map((part, index) =>
                part.toLowerCase() === highlight.toLowerCase() ? (
                    <span key={index} className="  text-red-600 font-bold">
                        {part}
                    </span>
                ) : (
                    part
                )
            )}
        </span>
    );
   
};


const CustomerTable = ({ customers, transactions }) => {
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const customerData = useMemo(() => {
        return customers.map(customer => ({
            ...customer,
            transactions: transactions.filter(tx => tx.customer_id === customer.id),
        }));
    }, [customers, transactions]);

    const filteredData = useMemo(() => {
        const lowerCaseFilter = globalFilter.toLowerCase();
        return customerData.filter((customer) => {
            return (
                customer.name.toLowerCase().includes(lowerCaseFilter) ||
                customer.transactions.some(tx =>
                    tx.amount.toString().includes(lowerCaseFilter)
                )
            );
        });
    }, [customerData, globalFilter]);

    const columns = useMemo(
        () => [
            {
                accessorKey: 'name',
                header: 'Name',
                Cell: ({ cell }) => (
                    <span
                        style={{ color: 'blue', cursor: 'pointer' }}
                        onClick={() => setSelectedCustomer(cell.row.original)}
                    >
                        <HighlightText text={cell.getValue()} highlight={globalFilter} />
                    </span>
                ),
            },
            {
                accessorKey: 'transactions',
                header: 'Transactions',
                Cell: ({ cell }) => (
                    <div className='flex justify-center items-center'>
                        <table className=' border-2 text-center w-full '>
                            <thead className='border-b'>
                                <tr >
                                    <th className='p-2'>Date</th>
                                    <th className='p-2'>Amount</th>
                                </tr>
                            </thead>
                            <tbody className='text-center'>
                                {cell.row.original.transactions.map(tx => (
                                    <tr key={tx.id} >
                                        <td className='p-2'>{tx.date}</td>
                                        <td className="p-2">
                                            <HighlightText text={tx.amount.toString()} highlight={globalFilter} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ),
            },
        ],
        [globalFilter]
    );
  
    const table = useMaterialReactTable({
        columns,
        data: filteredData,
        initialState: {
            pagination: { pageSize: 5, pageIndex: 0 },
            showGlobalFilter: true,
        },
        muiPaginationProps: {
            rowsPerPageOptions: [5, 10, 15],
            variant: 'outlined',
        },
        paginationDisplayMode: 'pages',
        getRowId: (originalRow) => originalRow.id,
    });

    const handleClose = () => {
        setSelectedCustomer(null);
    };

    return (
        <Container maxWidth="xl">
            <Stack sx={{ m: '2rem 0' }}>
                <Typography variant="h4" className='text-left !mb-8'>Customer Transaction</Typography>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <TextField
                        label="Search by Name or Amount"
                        variant="outlined"
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        sx={{ marginBottom: '1rem' }}
                        className='w-1/2 '
                    />
                </Box>

                <Box sx={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableCell align="center" variant="head" key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHead>
                            <TableBody>
                                {table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell align="center" variant="body" key={cell.id}>
                                                {flexRender(cell.column.columnDef.Cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
                <MRT_TablePagination table={table} />
                <MRT_ToolbarAlertBanner stackAlertBanner table={table} />
                <Dialog open={!!selectedCustomer}  maxWidth="lg" fullWidth>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
>
                      <DialogTitle>Transactions for <span className='text-blue-700'>{selectedCustomer?.name}</span></DialogTitle>  
                      <i  onClick={handleClose} className="fa-solid fa-xmark fa-xl mr-6" style={{"color": "#000000;"}} ></i>
                    </Box>
                    
                     
                    <DialogContent>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart
                                data={selectedCustomer?.transactions}
                                margin={{
                                    top: 5, right: 30, left: 20, bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="amount" stroke="#8884d8" activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </DialogContent>
                </Dialog>
            </Stack>
        </Container>
    );
};

export default CustomerTable;





