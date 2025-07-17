import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        textAlign: 'center'
      }}
    >
      <Typography variant="h1" color="primary" gutterBottom>
        404
      </Typography>
      <Typography variant="h4" gutterBottom>
        Página não encontrada
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        A página que você está procurando não existe.
      </Typography>
      <Button
        component={Link}
        to="/dashboard"
        variant="contained"
        size="large"
      >
        Voltar ao Dashboard
      </Button>
    </Box>
  );
};

export default NotFoundPage;