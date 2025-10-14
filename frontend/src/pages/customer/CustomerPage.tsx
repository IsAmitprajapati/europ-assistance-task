import { Box, Button, Typography, CircularProgress, TextField, IconButton, InputAdornment } from "@mui/material";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { ICustomer } from "../../types/customer";
import api from "../../utils/Axios";
import { endpoints } from "../../utils/endpoint";
import toast from "react-hot-toast";
import type { TableColumn } from "../../component/TableBox";
import TableBox from "../../component/TableBox";
import { IconPlus, IconSearch, IconX } from "@tabler/icons-react";
import { useDebounce } from '../../hooks/useDebounce';
import queryString from "query-string";

export default function CustomerPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // Memoized query params from URL
    const query = useMemo(() => queryString.parse(location.search), [location.search]);
    const initialPage = Number(query.page) || 1;
    const initialPageSize = Number(query.limit) || 10;
    const initialSearch = typeof query.search === 'string' ? query.search : '';

    // State for table, pagination and search
    const [data, setData] = useState<ICustomer[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const [page, setPage] = useState<number>(initialPage);
    const [limit, setLimit] = useState<number>(initialPageSize);
    const [totalData, setTotalData] = useState<number>(0);

    const [search, setSearch] = useState(initialSearch);
    const [searchInput, setSearchInput] = useState(initialSearch);

    // Debounced input for delayed search query
    const debouncedSearchInput = useDebounce(searchInput, 400);

    // Avoid unnecessary url update loop on first load
    const isFirstLoad = useRef(true);

    // Update state when debounced input changes
    useEffect(() => {
        if (debouncedSearchInput.trim() !== search) {
            setPage(1); // Reset page
            setSearch(debouncedSearchInput.trim());
        }
        // eslint-disable-next-line
    }, [debouncedSearchInput]);

    // Sync state to URL when page, limit, or search changes
    useEffect(() => {
        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            return;
        }
        const params: any = {
            ...query,
            page: page.toString(),
            limit: limit.toString(),
        };
        if (search && search.length > 0) {
            params.search = search;
        } else {
            delete params.search;
        }
        navigate({ search: queryString.stringify(params) }, { replace: true });
        // eslint-disable-next-line
    }, [page, limit, search]);

    
    // Refetch data when URL (location.search) changes
    useEffect(() => {
        const effectiveQuery = queryString.parse(location.search);
        const p = Number(effectiveQuery.page) || 1;
        const l = Number(effectiveQuery.limit) || 10;
        const s = typeof effectiveQuery.search === "string" ? effectiveQuery.search : "";
        setPage(p);
        setLimit(l);
        setSearchInput(s);
        setSearch(s);

        async function fetchCustomerData() {
            setLoading(true);
            try {
                const response = await api.get(endpoints.customer, {
                    params: {
                        page: p,
                        limit: l,
                        search: s.length > 0 ? s : undefined
                    }
                });
                if (response.data?.success) {
                    setData(response.data.data || []);
                    setTotalData(response.data.total ?? 0);
                } else {
                    setData([]);
                    setTotalData(0);
                }
            } catch (error: any) {
                toast.error(error?.response?.data?.message || error?.message || "Failed to fetch");
                setData([]);
                setTotalData(0);
            } finally {
                setLoading(false);
            }
        }
        fetchCustomerData();
    }, [location.search]);

    // Table columns
    const columns = useMemo<TableColumn<ICustomer>[]>(() => [
        {
            field: '_id',
            headerName: 'Sr.No',
            renderCell: (_row, idx) => (page - 1) * limit + idx + 1,
            width: 80,
        },
        {
            field: 'name',
            headerName: 'Customer Name',
        },
        {
            field: 'email',
            headerName: 'Customer Email',
        },
        {
            field: 'age',
            headerName: 'Age',
        },
        {
            field: 'phone',
            headerName: 'Phone',
        },
        {
            field: 'status',
            headerName: 'Status',
            renderCell: (row) => row.status ?? "-", // fallback for missing status
        },
        {
            field: 'engagement_score',
            headerName: 'Engagement Score',
            renderCell: (row) => row.engagement_score ?? "-",
        },
        {
            field: 'lifecycle_stage',
            headerName: 'Lifecycle Stage',
            renderCell: (row) => row.lifecycle_stage ?? "-",
        },
        {
            field: 'payment_behavior',
            headerName: 'Payment Behavior',
            renderCell: (row) => row.payment_behavior ?? "-",
        },
        {
            field: 'createdAt',
            headerName: 'Created At',
            renderCell: (row) =>
                row.createdAt
                    ? new Date(row.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                    })
                    : '-',
            width: 180,
        },
    ], [page, limit]);

    // Table page handlers: update state, which will sync to URL (triggering fetch)
    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const handlePageSizeChange = useCallback((newPageSize: number) => {
        setLimit(newPageSize);
        setPage(1); // Reset to first page when changing page size
    }, []);

    // Search handlers for the input
    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchInput.trim() !== search) {
            setPage(1);
            setSearch(searchInput.trim());
        }
    };

    const handleClearSearch = () => {
        setSearchInput('');
        if (search !== '') {
            setPage(1);
            setSearch('');
        }
    };

    return (
        <Box>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 3,
                }}
            >
                <Typography variant="h3" component="h2" gutterBottom>
                    Customers
                </Typography>

                <Button
                    variant="contained"
                    startIcon={<IconPlus />}
                    onClick={() => navigate("/dashboard/customer/create")}
                >
                    New Customer
                </Button>
            </Box>

            <Box
                component="form"
                onSubmit={handleSearchSubmit}
                sx={{ mb: 2, maxWidth: 360 }}
            >
                <TextField
                    size="small"
                    variant="outlined"
                    fullWidth
                    placeholder="Search segment name"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                {searchInput ? (
                                    <IconButton
                                        size="small"
                                        onClick={handleClearSearch}
                                        aria-label="Clear search"
                                    >
                                        <IconX />
                                    </IconButton>
                                ) : null}
                                <IconButton type="submit" size="small" aria-label="Search">
                                    <IconSearch />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableBox
                    data={data}
                    columns={columns}
                    page={page}
                    pageSize={limit}
                    totalCount={totalData}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            )}
        </Box>
    );
}