import { Box, Drawer, Tooltip, Typography } from "@mui/material";
import { IconEye } from "@tabler/icons-react";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import queryString from "query-string";
import api from "../../../utils/Axios";
import { endpoints } from "../../../utils/endpoint";
import type { ICustomer } from "../../../types/customer";
import TableBox, { type TableColumn } from "../../../component/TableBox";

interface IViewCustomerBySegment {
    segmentId: string;
    segmentName: string;
    customerCount: number;
}

export default function ViewCustomerBySegment({
    segmentId,
    segmentName,
    customerCount,
}: IViewCustomerBySegment) {
    const navigate = useNavigate();
    const location = useLocation();
    const prevSearchRef = useRef<string>("");

    // Get current segmentid from URL (from query params)
    const currentQuery = useMemo(() => queryString.parse(location.search), [location.search]);
    const segmentidInUrl = currentQuery.segmentid as string | undefined;

    // determine drawer state by checking segmentid in URL
    const openDrawer = Boolean(segmentidInUrl) && segmentidInUrl === segmentId;

    // Table data and pagination
    const [data, setData] = useState<Partial<ICustomer>[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(
        Number(currentQuery.segPage) || 1
    );
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalData, setTotalData] = useState<number>(0);
    const [limit, setLimit] = useState<number>(
        Number(currentQuery.segLimit) || 10
    );

    // Update page and limit from segPage/segLimit in url in sync
    useEffect(() => {
        // only change state if URL has params for this segment
        if (segmentidInUrl === segmentId) {
            const urlPage = Number(currentQuery.segPage) || 1;
            const urlLimit = Number(currentQuery.segLimit) || 10;
            if (urlPage !== page) setPage(urlPage);
            if (urlLimit !== limit) setLimit(urlLimit);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search, segmentidInUrl, segmentId]);

    // Helper to build updated search string with segmentid, segPage, segLimit
    const getUpdatedSearch = useCallback(
        (newPage: number, newLimit: number) => {
            const searchObj = queryString.parse(location.search);
            searchObj.segmentid = segmentId;
            searchObj.segPage = String(newPage);
            searchObj.segLimit = String(newLimit);
            return `?${queryString.stringify(searchObj)}`;
        },
        [location.search, segmentId]
    );

    // When user clicks open icon, set segmentid in URL (also store prev search for return)
    const handleOpenDrawer = () => {
        prevSearchRef.current = location.search;
        // always start at page 1, limit 10 if first time opening (or keep page/limit state)
        const newSearch = getUpdatedSearch(1, 10);
        navigate(
            { pathname: location.pathname, search: newSearch },
            { replace: true }
        );
    };

    // When drawer closes, remove segmentid and segPage/segLimit from URL
    const handleCloseDrawer = () => {
        // Remove segmentid/segPage/segLimit from current query
        const searchObj = queryString.parse(location.search);
        delete searchObj.segmentid;
        delete searchObj.segPage;
        delete searchObj.segLimit;
        navigate(
            { pathname: location.pathname, search: queryString.stringify(searchObj) },
            { replace: true }
        );
    };

    // Fetch customers for segment with respect to pagination (page, limit)
    const fetchSegmentWiseCustomer = useCallback(async () => {
        if (!openDrawer) return;
        setLoading(true);
        try {
            const params: any = {
                page,
                limit,
            };
            const response = await api.get(endpoints.segmentWiseCustomer(segmentId), { params });

            if (response.data.success) {
                setData(response.data.data);
                setTotalPages(response.data.totalPages);
                setTotalData(response.data.totalItems);
            }
        } catch (error) {
            // error handling can be improved as needed
        } finally {
            setLoading(false);
        }
    }, [segmentId, page, limit, openDrawer]);

    // Fetch when the drawer is open, on page or limit change
    useEffect(() => {
        fetchSegmentWiseCustomer();
    }, [openDrawer, fetchSegmentWiseCustomer]);

    // Table columns, memoized by page/pageSize
    const columns = useMemo<TableColumn<Partial<ICustomer>>[]>(() => [
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
            field: 'segment',
            headerName: 'Segment',
            renderCell: (row) =>
                Number(row.segment?.length)
        },
    ], [page, limit]);

    // Table page handlers
    const handlePageChange = (newPage: number) => {
        // Update segPage in url; keep limit
        const newSearch = getUpdatedSearch(newPage, limit);
        navigate(
            { pathname: location.pathname, search: newSearch },
            { replace: true }
        );
    };
    const handlePageSizeChange = (newLimit: number) => {
        // Update segLimit and set page to 1
        const newSearch = getUpdatedSearch(1, newLimit);
        navigate(
            { pathname: location.pathname, search: newSearch },
            { replace: true }
        );
    };

    return (
        <>
            <Tooltip title="View Customer">
                <Box
                    onClick={handleOpenDrawer}
                    sx={{
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <IconEye />
                </Box>
            </Tooltip>
            <Drawer
                anchor="right"
                open={openDrawer}
                onClose={handleCloseDrawer}
                PaperProps={{
                    sx: {
                        width: "80vw",
                        maxWidth: "100vw",
                        borderRadius: 0,
                    },
                }}
            >
                <Box sx={{ p: 2 }}>
                    <Typography variant="h3" component="h2" gutterBottom>
                        {segmentName} ({customerCount})
                    </Typography>
                </Box>
                {/* Table with pagination */}
                <Box sx={{ p: 2 }}>
                    <TableBox
                        data={data}
                        columns={columns}
                        page={page}
                        pageSize={limit}
                        totalCount={totalData}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                    />
                </Box>
            </Drawer>
        </>
    );
}