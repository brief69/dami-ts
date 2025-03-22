import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StorageIcon from '@mui/icons-material/Storage';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import HistoryIcon from '@mui/icons-material/History';
import RouterIcon from '@mui/icons-material/Router';
import VideocamIcon from '@mui/icons-material/Videocam';

const drawerWidth = 240;

interface SidebarProps {
  open: boolean;
}

interface MenuItemProps {
  path: string;
  text: string;
  icon: React.ReactNode;
}

const menuItems: MenuItemProps[] = [
  { path: '/', text: 'ダッシュボード', icon: <DashboardIcon /> },
  { path: '/chunk-test', text: 'チャンクテスト', icon: <StorageIcon /> },
  { path: '/recipe-test', text: 'レシピテスト', icon: <MenuBookIcon /> },
  { path: '/history-test', text: '履歴テスト', icon: <HistoryIcon /> },
  { path: '/p2p-test', text: 'P2Pテスト', icon: <RouterIcon /> },
  { path: '/media-test', text: 'メディアテスト', icon: <VideocamIcon /> },
];

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          position: 'relative',
          whiteSpace: 'nowrap',
          transition: (theme) =>
            theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          ...(!open && {
            overflowX: 'hidden',
            width: 0,
            transition: (theme) =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
          }),
        },
      }}
    >
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar; 