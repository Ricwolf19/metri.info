/**
 * App icons — backed by Iconoir. Re-exported under stable names that mirror the
 * mobile app's barrel (`HomeIcon`, `BellIcon`, `GearIcon`, …) so shared mental
 * models carry over. Each Iconoir icon is wrapped so it accepts a `size` (px)
 * prop like before (Iconoir natively takes width/height). To add one, map
 * another Iconoir icon here.
 */
import { createElement, type ComponentType, type SVGProps } from "react";

import {
  Activity,
  Apple,
  ArrowLeft,
  ArrowRight,
  Bell,
  BellOff,
  Book,
  Bookmark,
  Calculator,
  Check,
  CloudSync,
  Code,
  Compass,
  Copy,
  Download,
  Droplet,
  Eye,
  EyeClosed,
  FireFlame,
  Flash,
  GraphUp,
  Group,
  Gym,
  HalfMoon,
  Heart,
  Home,
  InfoCircle,
  Leaf,
  Link as LinkIcoit,
  Lock,
  LogOut,
  Mail,
  Medal,
  Menu,
  Plus,
  ProfileCircle,
  NavArrowRight,
  Refresh,
  Ruler,
  Search,
  Settings,
  ShareAndroid,
  Shield,
  SmartphoneDevice,
  Star,
  StarSolid,
  Timer,
  Trash,
  Trophy,
  WarningTriangle,
  Weight,
  WifiOff,
  Xmark,
} from "iconoir-react";

export { GithubIcon } from "./GithubMark";
export { GmailIcon } from "./GmailMark";

/** Square size in px (maps to width + height). Mirrors lucide's `size`. */
export type IconProps = Omit<SVGProps<SVGSVGElement>, "ref"> & {
  size?: number;
};

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

/** Wrap an Iconoir icon so it accepts our `size` (px) prop. */
const sized = (Icon: IconComponent, name: string) => {
  const Wrapped = ({ size = 24, ...props }: IconProps) =>
    createElement(Icon, { width: size, height: size, ...props });
  Wrapped.displayName = name;
  return Wrapped;
};

export const HomeIcon = sized(Home, "HomeIcon");
export const ActivityIcon = sized(Activity, "ActivityIcon");
export const BookIcon = sized(Book, "BookIcon");
export const BookmarkIcon = sized(Bookmark, "BookmarkIcon");
export const GearIcon = sized(Settings, "GearIcon");
export const ChevronRightIcon = sized(NavArrowRight, "ChevronRightIcon");
export const FlameIcon = sized(FireFlame, "FlameIcon");
export const LogOutIcon = sized(LogOut, "LogOutIcon");
export const ShieldIcon = sized(Shield, "ShieldIcon");
export const DumbbellIcon = sized(Gym, "DumbbellIcon");
export const CheckIcon = sized(Check, "CheckIcon");
export const XIcon = sized(Xmark, "XIcon");
export const TrophyIcon = sized(Trophy, "TrophyIcon");
export const MenuIcon = sized(Menu, "MenuIcon");
export const MoonIcon = sized(HalfMoon, "MoonIcon");
export const SearchIcon = sized(Search, "SearchIcon");
export const ArrowRightIcon = sized(ArrowRight, "ArrowRightIcon");
export const ArrowLeftIcon = sized(ArrowLeft, "ArrowLeftIcon");
export const ZapIcon = sized(Flash, "ZapIcon");
export const WifiOffIcon = sized(WifiOff, "WifiOffIcon");
export const TrendingUpIcon = sized(GraphUp, "TrendingUpIcon");
export const CodeIcon = sized(Code, "CodeIcon");
export const CalculatorIcon = sized(Calculator, "CalculatorIcon");
export const AppleIcon = sized(Apple, "AppleIcon");
export const DropletsIcon = sized(Droplet, "DropletsIcon");
export const ScaleIcon = sized(Weight, "ScaleIcon");
export const RulerIcon = sized(Ruler, "RulerIcon");
export const HeartIcon = sized(Heart, "HeartIcon");
export const SmartphoneIcon = sized(SmartphoneDevice, "SmartphoneIcon");
export const DownloadIcon = sized(Download, "DownloadIcon");
export const CopyIcon = sized(Copy, "CopyIcon");
export const EyeIcon = sized(Eye, "EyeIcon");
export const EyeOffIcon = sized(EyeClosed, "EyeOffIcon");
export const MailIcon = sized(Mail, "MailIcon");
export const ShareIcon = sized(ShareAndroid, "ShareIcon");
export const StarIcon = sized(Star, "StarIcon");
export const StarSolidIcon = sized(StarSolid, "StarSolidIcon");
export const LockIcon = sized(Lock, "LockIcon");
export const LinkIcon = sized(LinkIcoit, "LinkIcon");
export const ProfileIcon = sized(ProfileCircle, "ProfileIcon");
export const UsersIcon = sized(Group, "UsersIcon");
export const AlertTriangleIcon = sized(WarningTriangle, "AlertTriangleIcon");
export const InfoIcon = sized(InfoCircle, "InfoIcon");
export const BellIcon = sized(Bell, "BellIcon");
export const BellOffIcon = sized(BellOff, "BellOffIcon");
export const CloudSyncIcon = sized(CloudSync, "CloudSyncIcon");
export const CompassIcon = sized(Compass, "CompassIcon");
export const LeafIcon = sized(Leaf, "LeafIcon");
export const MedalIcon = sized(Medal, "MedalIcon");
export const PlusIcon = sized(Plus, "PlusIcon");
export const RefreshIcon = sized(Refresh, "RefreshIcon");
export const TimerIcon = sized(Timer, "TimerIcon");
export const TrashIcon = sized(Trash, "TrashIcon");
