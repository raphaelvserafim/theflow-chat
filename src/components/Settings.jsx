import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import { Grid, TextField } from '@mui/material';

export function AccordionSettings(props) {
  const [key, setKey] = React.useState(props?.gptKey);

  const handleKey = (event) => {
    setKey(event?.target?.value);
  }

  const save = () => {
    props?.save(key);
  }
  
  return (
    <div>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          GPT
        </AccordionSummary>
        <AccordionDetails>
          <Grid container>
            <Grid item md={12} mb={1}>
              <TextField value={key} onChange={handleKey} label="Key" variant="outlined" type="password" fullWidth />
            </Grid>
            <Grid item md={12}>
              <Button onClick={save}> Salvar </Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

    </div>
  );
}
