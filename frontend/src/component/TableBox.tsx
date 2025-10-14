import React from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TablePagination,
  Typography,
  Box,
} from '@mui/material';

export interface TableColumn<T = any> {
  /** key: string or path for the column data */
  field: keyof T | string;
  /** Column header label */
  headerName: string;
  /** Optional: align cell content - "left" | "center" | "right" */
  align?: 'left' | 'center' | 'right';
  /** Optional: width or sx for TableCell */
  width?: number | string;
  /** Optional: custom render cell (row, rowIndex) */
  renderCell?: (row: T, rowIndex: number) => React.ReactNode;
}

export interface TableBoxProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  minWidth?: number | string;

  // Pagination props (optional for backward compatibility)
  page?: number; // 1-based index
  pageSize?: number;
  totalCount?: number;
  onPageChange?: (newPage: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
  /** Optional: sx for TableContainer or Table, you can extend later as needed */
}

/**
 * Reusable table component with optional pagination.
 * @param columns {TableColumn[]} - column configs
 * @param data {Array} - row data
 */
export default function TableBox<T = any>({
  columns,
  data,
  minWidth = 400,
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}: TableBoxProps<T>) {
  // If pagination props are provided, show TablePagination
  // TablePagination expects 0-based index for page
  const hasPagination =
    typeof page === 'number' &&
    typeof pageSize === 'number' &&
    typeof totalCount === 'number' &&
    typeof onPageChange === 'function' &&
    typeof onPageSizeChange === 'function';

  const noData = !data || data.length === 0;

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{ width: '100%', overflowX: 'auto', }}
      >
        <Table sx={{ minWidth }}>
          <TableHead>
            <TableRow>
              {columns?.map((col) => (
                <TableCell
                  key={String(col.field)}
                  align={col.align || 'left'}
                  sx={{
                    fontWeight: 600,
                    ...(col.width ? { width: col.width } : {}),
                    whiteSpace: 'nowrap'
                  }}
                >
                  {col.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {noData ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Box>
                    <Typography color="text.secondary">
                      No data found
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              data?.map((row, rowIdx) => (
                <TableRow key={rowIdx}>
                  {columns?.map((col) => (
                    <TableCell
                      key={String(col.field)}
                      align={col.align || 'left'}
                      sx={{
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {col.renderCell
                        ? col.renderCell(row, rowIdx)
                        : String(
                          typeof col.field === 'string'
                            ? getValue(row, col.field)
                            : row[col.field as keyof typeof row] ?? ''
                        )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {hasPagination && (
        <TablePagination
          component="div"
          count={totalCount!}
          page={Math.max(0, (page ?? 1) - 1)} // TablePagination uses 0-based index
          onPageChange={(_e, newPage) => onPageChange!(newPage + 1)}
          rowsPerPage={pageSize!}
          onRowsPerPageChange={e => {
            const newSize = parseInt(e.target.value, 10);
            onPageSizeChange!(newSize);
          }}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
        />
      )}
    </>
  );
}

// Helper: Support for nested field path (e.g., "customer.name")
function getValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}