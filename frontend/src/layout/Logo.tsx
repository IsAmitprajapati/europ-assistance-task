import { Link as RouterLink } from 'react-router-dom';

// material-ui
import Link from '@mui/material/Link';

export default function LogoSection() {
  return (
    <Link
      component={RouterLink}
      to={"/dashboard"}
      aria-label="theme-logo"
    >
      <img
        src="/logo.png"
        width={135}
        height={30}
        alt="logo"
        style={{ display: "block", margin: "0 auto" }}
      />
    </Link>
  );
}
