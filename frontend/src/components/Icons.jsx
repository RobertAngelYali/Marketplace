const common = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

function SvgIcon({ size = 24, className = "", children, ...props }) {
  return (
    <svg width={size} height={size} className={className} {...common} {...props}>
      {children}
    </svg>
  );
}

export const Menu = (props) => <SvgIcon {...props}><path d="M4 6h16M4 12h16M4 18h16" /></SvgIcon>;
export const X = (props) => <SvgIcon {...props}><path d="M18 6 6 18M6 6l12 12" /></SvgIcon>;
export const Search = (props) => <SvgIcon {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></SvgIcon>;
export const ShoppingCart = (props) => <SvgIcon {...props}><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L23 6H6" /></SvgIcon>;
export const ChevronDown = (props) => <SvgIcon {...props}><path d="m6 9 6 6 6-6" /></SvgIcon>;
export const ChevronRight = (props) => <SvgIcon {...props}><path d="m9 18 6-6-6-6" /></SvgIcon>;
export const ChevronUp = (props) => <SvgIcon {...props}><path d="m18 15-6-6-6 6" /></SvgIcon>;
export const User = (props) => <SvgIcon {...props}><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="7" r="4" /></SvgIcon>;
export const UserCircle = (props) => <SvgIcon {...props}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20a5 5 0 0 1 10 0" /></SvgIcon>;
export const LogOut = (props) => <SvgIcon {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></SvgIcon>;
export const Package = (props) => <SvgIcon {...props}><path d="m16.5 9.4-9-5.2" /><path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7Z" /><path d="M3.3 7 12 12l8.7-5" /><path d="M12 22V12" /></SvgIcon>;
export const Home = (props) => <SvgIcon {...props}><path d="m3 10 9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M9 20v-6h6v6" /></SvgIcon>;
export const Phone = (props) => <SvgIcon {...props}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.4 2.1L8.1 9.5a16 16 0 0 0 6.4 6.4l1.2-1.2a2 2 0 0 1 2.1-.4c.8.3 1.6.5 2.5.6A2 2 0 0 1 22 16.9Z" /></SvgIcon>;
export const Mail = (props) => <SvgIcon {...props}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></SvgIcon>;
export const MapPin = (props) => <SvgIcon {...props}><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" /></SvgIcon>;
export const Tag = (props) => <SvgIcon {...props}><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" /><circle cx="7.5" cy="7.5" r=".5" /></SvgIcon>;
export const LayoutDashboard = (props) => <SvgIcon {...props}><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></SvgIcon>;
export const PlusCircle = (props) => <SvgIcon {...props}><circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" /></SvgIcon>;
export const ClipboardList = (props) => <SvgIcon {...props}><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M9 12h6M9 16h6" /></SvgIcon>;
export const Store = (props) => <SvgIcon {...props}><path d="M3 9h18l-1-5H4L3 9Z" /><path d="M4 9v11h16V9" /><path d="M8 20v-6h8v6" /></SvgIcon>;
export const Heart = (props) => <SvgIcon {...props}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" /></SvgIcon>;
