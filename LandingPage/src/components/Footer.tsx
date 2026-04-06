import { Box, Typography, Link, Divider, Grid, Stack } from '@mui/material';

const Footer = () => {
  const linkStyle = {
    color: 'rgba(255, 255, 255, 0.8)',
    textDecoration: 'none',
    fontSize: '0.95rem',
    '&:hover': {
      color: '#8B5CF6',
    },
  };

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#111827',
        color: '#ffffff',
        py: 6,
        px: { xs: 3, md: 10 },
        mt: 10,
      }}
    >
      {/* Top Section */}
      <Grid container spacing={4} justifyContent="space-between">
        <Grid>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            InpactAI
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Empowering brands to make smarter creator decisions through AI-powered insights and integrations.
          </Typography>
        </Grid>

        <Grid>
          <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
            Explore
          </Typography>
          <Stack spacing={1}>
            <Link href="/" sx={linkStyle}>Home</Link>
            <Link href="/" sx={linkStyle}>About</Link>
            <Link href="/" sx={linkStyle}>Contact</Link>
          </Stack>
        </Grid>

<Grid>
          <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
            Legal & Code
          </Typography>
          <Stack spacing={1}>
            <Link href="https://github.com/AOSSIE-Org/InPactAI" sx={linkStyle} target="_blank" rel="noopener">
              GitHub
            </Link>
            <Link href="https://www.youtube.com/@AOSSIE-Org" sx={linkStyle} target="_blank" rel="noopener">
              YouTube
            </Link>
            <Link href="/terms-of-service" sx={linkStyle}>Terms of Use</Link>
            <Link href="/privacy-policy" sx={linkStyle}>Privacy Policy</Link>
          </Stack>
        </Grid>
      </Grid>

      {/* Divider */}
      <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

      {/* Bottom Section */}
      <Typography
        variant="body2"
        align="center"
        sx={{ color: 'rgba(255, 255, 255, 0.4)' }}
      >
        © {new Date().getFullYear()} InpactAI. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
