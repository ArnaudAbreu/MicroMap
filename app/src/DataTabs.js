import React from 'react';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import PropTypes from 'prop-types';
import { DataPanel } from "./DataPanel"
import { DataGrid, GridToolbar } from '@material-ui/data-grid';


const exampleColumns = [
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

const exampleRows = [
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

const formatCsvColumns = (columns) => {
  const len = columns.length;
  const formatedColumns = columns.map((column) => {
    if (column === "SAMPLE_ID") {
      return (
        {
          field: "id",
          headerName: column,
          width: 200
        }
      );
    }
    else {
      return (
        {
          field: column,
          headerName: column.toUpperCase(),
          width: 200
        }
      );
    }
  });
  return (formatedColumns);
}

const formatCsvRow = (row) => {
  const { SAMPLE_ID: id, ...rest } = row;
  const newRow = { id, ...rest };
  return (newRow);
}

const formatCsvRows = (rows) => {
  const formatedRows = rows.map((row) => {
    return (formatCsvRow(row));
  });
  return (formatedRows);
}


const useStyles = makeStyles({
  root: {
    '& .MuiDataGrid-root .MuiDataGrid-columnHeaderRight .MuiDataGrid-columnHeader-draggable, .MuiDataGrid-root .MuiDataGrid-columnHeaderRight .MuiDataGrid-columnHeaderTitleContainer': {
	     flexDirection: 'row'
    },
    '& .MuiDataGrid-root .MuiDataGrid-columnHeaderTitle': {
      fontSize: '1rem'
    },
    '& .MuiDataGrid-root .MuiDataGrid-cellRight': {
    	textAlign: 'left'
    },
    '& .MuiCheckbox-colorPrimary.Mui-checked': {
      color: '#3ba8d6'
    },
    '& .MuiTablePagination-root': {
      color: 'white'
    },
    '& .MuiDataGrid-root': {
      color: 'white'
    },
    '& .MuiPaper-root': {
      backgroundColor: '#3b414d',
      height: '40vh',
    },
    '& .MuiTab-textColorPrimary.Mui-selected': {
	     color: '#3ba8d6'
    },
    '& .MuiTab-textColorPrimary': {
	     color: 'white'
    },
    '& .MuiTabs-root': {
      height: '4vh'
    }
  },
  tab_panel_container: {
    height: '34vh',
    display: 'flex',
  },
  tab_panel: {
    height: '34vh',
    flexGrow: 0.8,
    margin: '0 auto'
  }
});


const DataTabs = ({cohortGetter}) => {
  const [label, setLabel] = React.useState("Cohort");
  const [value, setValue] = React.useState(0);
  const [selectedSlide, setSelectedSlide] = React.useState(null);

  const handleChange = (event, newValue) => {
    setLabel(event.target.textContent);
    setValue(newValue);
    console.log("New tab value is: ", newValue);
    console.log("New tab event is: ", event.target.textContent);
  };

  const displayTabPanel = (chosenData) => {
    if (cohortGetter){
      return (
        <div className={classes.tab_panel}>
          <DataGrid
            rows={formatCsvRows(cohortGetter.rowData)}
            columns={formatCsvColumns(cohortGetter.columns)}
            pageSize={100}
            components={{
              Toolbar: GridToolbar
            }}
            checkboxSelection
            selectionModel={selectedSlide}
            onSelectionModelChange={(selection) => {
              const newSelectionModel = selection.selectionModel;

              if (newSelectionModel.length > 1) {
                const selectionSet = new Set(selectedSlide);
                const result = newSelectionModel.filter(
                  (s) => !selectionSet.has(s)
                );

                setSelectedSlide(result);
              } else {
                setSelectedSlide(newSelectionModel);
              }
            }}
            />
        </div>
      )
    }

    else {
      return (
        <div className={classes.tab_panel}>
          <DataGrid
            rows={exampleRows}
            columns={exampleColumns}
            pageSize={100}
            components={{
              Toolbar: GridToolbar
            }}
            checkboxSelection
            />
        </div>
      )
    }

  }

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Paper square >
        <Tabs
          style={{backgroundColor: "#3b414d", color: "#fff" }}
          value={value}
          indicatorColor="primary"
          textColor="primary"
          onChange={handleChange}
          aria-label="Dataframe tabs"
          centered
        >
          <Tab label="Cohort"/>
          <Tab label="Slide"/>
        </Tabs>
        <div className={classes.tab_panel_container}>
          {displayTabPanel(label)}
        </div>
      </Paper>
    </div>
  );
}

export {
  DataTabs
};
