import * as React from 'react';
import { DataGrid, GridToolbar } from '@material-ui/data-grid';
import { makeStyles } from '@material-ui/styles';


const columns = [
  { field: 'id', headerName: 'ID', flex: 0.25 },
  { field: 'firstName', headerName: 'First name', flex: 0.25 },
  { field: 'lastName', headerName: 'Last name', flex: 0.25 },
  {
    field: 'age',
    headerName: 'Age',
    type: 'number',
    flex: 0.25,
  }
];

const rows = [
  { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
  { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
  { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
  { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
  { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
  { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
  { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
  { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
  { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
];

const useStyles = makeStyles({
  root: {
    '& .MuiDataGrid-root': {
      color: 'white',
      marginBottom: '10px'
    },
    '& .MuiCheckbox-root': {
      color: 'white',
    },
    '& .MuiTablePagination-root': {
      color: 'white'
    },
    '& .MuiDataGrid-root .MuiDataGrid-columnHeaderRight .MuiDataGrid-columnHeader-draggable, .MuiDataGrid-root .MuiDataGrid-columnHeaderRight .MuiDataGrid-columnHeaderTitleContainer': {
      flexDirection: 'row',
    },
    '& .MuiDataGrid-root .MuiDataGrid-cellRight': {
      textAlign: 'left',
    },
  },
});

const DataPanel = () => {
  const classes = useStyles();
  return (
    <div
      className={classes.root}
      style={{
        height: 300,
        width: '80%',
        backgroundColor: '#3b414d',
        color: "#fff",
        margin: "auto"
      }}
      >
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={7}
        style={{color: "#fff"}}
        components={{
          Toolbar: GridToolbar
        }}
        checkboxSelection
        />
    </div>
  );
}

export {
  DataPanel
};
