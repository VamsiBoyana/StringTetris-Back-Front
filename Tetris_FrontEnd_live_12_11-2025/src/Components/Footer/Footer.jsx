import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import { styled } from '@mui/material/styles';
import { User, CheckSquare, Gamepad2, Users, Blocks } from 'lucide-react';


const StyledBottomNavigation = styled(BottomNavigation)(({ theme }) => ({
  width: '100%',
  height: '50px',
  position: 'fixed',
  // background: '#121212',
  // backdropFilter: 'blur(12px)',
  background: "rgba(17, 16, 35, 0.6)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.18)",
  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
  bottom: 0,
  left: 0,
  right: 0,
  borderRadius: '10px 10px 0 0',
  '& .Mui-selected': {
    '& .MuiBottomNavigationAction-label': {
      color: '#ff5500 !important',
      fontSize: '12px !important',
      opacity: '1 !important',
    },
    '& .MuiSvgIcon-root': {
      color: '#ff5500 !important', // This will color Lucide icons
    },
    color: '#ff5500 !important',
    // REMOVE the .MuiAvatar-root and ::before/::after rules!
  },
  '& .MuiBottomNavigationAction-root': {
    color: '#ffffff',
    '& .MuiBottomNavigationAction-label': {
      color: '#ffffff',
      fontSize: '10px',
      opacity: 1,
      transition: 'color 0.3s ease', 
    },
    '& .MuiSvgIcon-root': {
      width: 28,
      height: 28,
      transition: 'all 0.3s ease',
    },
    '&:focus': {
      outline: 'none',
    },
    minWidth: 'unset',
    padding: '6px 0',
  },
  '& .MuiTouchRipple-root': {
    display: 'none',
  },
}));

export default function LabelBottomNavigation() {
  const location = useLocation();
  const [value, setValue] = React.useState(location.pathname);

  React.useEffect(() => {
    setValue(location.pathname);
  }, [location.pathname]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <StyledBottomNavigation 
      value={value} 
      onChange={handleChange}
      showLabels
    >
      <BottomNavigationAction
        component={Link}
        to="/profile"
        label="Profile"
        value="/profile"
        icon={<User className="w-7 h-7 text-white" />} // Tailwind classes for size and color
      />
      <BottomNavigationAction
        component={Link}
        to="/task"
        label="Tasks"
        value="/task"
        icon={<CheckSquare className="w-7 h-7 text-white" />}
      />
      <BottomNavigationAction
        component={Link}
        to="/"
        label="Games"
        value="/"
        icon={<Blocks className="w-7 h-7 text-white" />}
      />
      <BottomNavigationAction
        component={Link}
        to="/refer"
        label="Refer"
        value="/refer"
        icon={<Users className="w-7 h-7 text-white" />}
      />
       {/* <BottomNavigationAction
        component={Link}
        to="/ranks"
        label="Ranks"
        value="/ranks"
        icon={<Avatar src={leaderboard} />}
      /> */}
      {/* <BottomNavigationAction
        component={Link}
        to="/ads"
        label="Ads"
        value="/ads"
        icon={<Avatar src={about} />}
      /> */}
    </StyledBottomNavigation>
  );
}

