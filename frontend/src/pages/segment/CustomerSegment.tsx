import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CreateSegment from './_component/CreateSegment';
import TableBox, { type TableColumn } from '../../component/TableBox';
import Loader from '../../component/Loader';
import { endpoints } from '../../utils/endpoint';
import api from '../../utils/Axios';
import ViewCustomerBySegment from './_component/ViewCustomerBySegment';
import queryString from 'query-string';
import { useLocation, useNavigate } from 'react-router-dom';
import { IconX } from '@tabler/icons-react';
import { useDebounce } from '../../hooks/useDebounce';


type SegmentRow = {
  _id: string;
  name: string;
  customersCount: number;
  customers?: [];
  updatedAt: string;
};

const getCustomerCount = (seg: any): number => {
  if (typeof seg.customersCount === 'number') return seg.customersCount;
  if (Array.isArray(seg.customers)) return seg.customers.length;
  if (typeof seg.customers === 'number') return seg.customers;
  return 0;
};

export default function CustomerSegmentPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Read query params using `query-string`
  const query = useMemo(() => queryString.parse(location.search), [location.search]);
  const initialPage = Number(query.page) || 1;
  const initialPageSize = Number(query.limit) || 10;
  const initialSearch = typeof query.search === 'string' ? query.search : '';

  // Pagination/search state
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [search, setSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [totalCount, setTotalCount] = useState(0);
  const [data, setData] = useState<SegmentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce the search input for API call
  const debouncedSearchInput = useDebounce(searchInput, 400);

  // Avoid unnecessary page/limit/search reset loops
  const isFirstLoad = useRef(true);


  // Handle search input submit (either icon click or Enter)
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Only change if different (will trigger url update via useEffect)
    if (searchInput.trim() !== search) {
      setPage(1); // reset page when search changes
      setSearch(searchInput.trim());
    }
  };

  // allow clearing search
  const handleClearSearch = () => {
    setSearchInput('');
    if (search !== '') {
      setPage(1);
      setSearch('');
    }
  };

  // Whenever input changes, update search param state to trigger url change (and api)
  useEffect(() => {
    if (debouncedSearchInput.trim() !== search) {
      setPage(1); // Reset to first page on search
      setSearch(debouncedSearchInput.trim());
    }
  }, [debouncedSearchInput]);

  // Sync state with URL on changes (adds search param)
  useEffect(() => {
    // Don't update url on initial mount if url already matches state
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    const params: any = { ...query, page: page.toString(), limit: pageSize.toString() };
    if (search && search.length > 0) {
      params.search = search;
    } else {
      // Remove search param if empty
      delete params.search;
    }

    navigate({ search: queryString.stringify(params) }, { replace: true });

  }, [page, pageSize, search]);

  // When location changes to new page/limit/search, update state to match URL
  useEffect(() => {
    const pageFromUrl = Number(query.page) || 1;
    const pageSizeFromUrl = Number(query.limit) || 10;
    const searchFromUrl = typeof query.search === 'string' ? query.search : '';

    if (pageFromUrl !== page) setPage(pageFromUrl);
    if (pageSizeFromUrl !== pageSize) setPageSize(pageSizeFromUrl);
    if (searchFromUrl !== search) {
      setSearch(searchFromUrl);
      setSearchInput(searchFromUrl);
    }
  }, [location.search]);

  // Table columns, memoized by page/pageSize
  const columns = useMemo<TableColumn<SegmentRow>[]>(() => [
    {
      field: '_id',
      headerName: 'Sr.No',
      renderCell: (_row, idx) => (page - 1) * pageSize + idx + 1,
      width: 80,
    },
    {
      field: 'name',
      headerName: 'Segment Name',
    },
    {
      field: 'customersCount',
      headerName: 'Customer Count',
      renderCell: (row) => getCustomerCount(row),
    },
    {
      field: 'updatedAt',
      headerName: 'Updated At',
      renderCell: (row) =>
        row.updatedAt
          ? new Date(row.updatedAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : '-',
      width: 180,
    },
    {
      field: 'customers',
      headerName: 'Actions',
      renderCell: (row) => (
        <ViewCustomerBySegment
          segmentId={row?._id}
          segmentName={row?.name}
          customerCount={getCustomerCount(row)}
        />
      ),
    },
  ], [page, pageSize]);

  // Function for calling the api (add search to params)
  const fetchSegment = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, any> = {
        page,
        limit: pageSize,
      };
      if (search && search.length > 0) {
        params.search = search;
      }
      const response = await api.get(endpoints.segment, { params });
      setData(response.data.data);
      setTotalCount(response?.data?.totalItems || 0);
    } catch (err: any) {
      setError(
        err?.response?.data?.message
          || err?.message
          || 'Failed to fetch segment data'
      );
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  // Calling the api fetch the data
  useEffect(() => {
    fetchSegment();
  }, [fetchSegment]);

  // Table page handlers
  const handlePageChange = (newPage: number) => setPage(newPage);
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
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
          Segment
        </Typography>
        
        {/* Refresh list after creating a segment */}
        <CreateSegment onCreated={fetchSegment} />
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
                    <IconX/>
                  </IconButton>
                ) : null}
                <IconButton type="submit" size="small" aria-label="Search">
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
      {loading ? (
        <Loader />
      ) : error ? (
        <Box sx={{ color: 'error.main', my: 3, fontWeight: 600 }}>
          {error}
        </Box>
      ) : (
        <TableBox
          data={data}
          columns={columns}
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </Box>
  );
}