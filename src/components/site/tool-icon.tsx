/** Central lucide icon mapping for tool cards and categories. */

import {
  Minimize2, Maximize2, FileImage, Image as ImageIcon, Target, SlidersHorizontal, Award, Layers,
  Percent, MoveHorizontal, MoveVertical, Frame, ZoomIn, Grid2x2, Crop, Square, Circle,
  RectangleHorizontal, RectangleVertical, Proportions, Scissors, Repeat, FileText, AppWindow,
  Binary, PenTool, Shuffle, RotateCw, RotateCcw, FlipHorizontal2, FlipVertical2, Contrast,
  Palette, Droplet, Focus, Sun, CircleDot, Rainbow, Camera, Layers2, Grid3x3, Blend, Sparkles,
  Aperture, Pipette, SwatchBook, Paintbrush, Eraser, Thermometer, Stamp, BadgePlus, Grid2x2Check,
  CalendarClock, Type, Captions, Laugh, Quote, Heading, SquareDashed, Scan, BoxSelect, Share2,
  IdCard, Printer, Gauge, Globe, Star, Mail, TrendingDown, FileSearch, ShieldCheck, MapPinOff,
  Wand2, RefreshCw, type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Minimize2, Maximize2, FileImage, Image: ImageIcon, Target, SlidersHorizontal, Award, Layers,
  Percent, MoveHorizontal, MoveVertical, Frame, ZoomIn, Grid2x2, Crop, Square, Circle,
  RectangleHorizontal, RectangleVertical, Proportions, Scissors, Repeat, FileText, AppWindow,
  Binary, PenTool, Shuffle, RotateCw, RotateCcw, FlipHorizontal2, FlipVertical2, Contrast,
  Palette, Droplet, Focus, Sun, CircleDot, Rainbow, Camera, Layers2, Grid3x3, Blend, Sparkles,
  Aperture, Pipette, SwatchBook, Paintbrush, Eraser, Thermometer, Stamp, BadgePlus, Grid2x2Check,
  CalendarClock, Type, Captions, Laugh, Quote, Heading, SquareDashed, Scan, BoxSelect, Share2,
  IdCard, Printer, Gauge, Globe, Star, Mail, TrendingDown, FileSearch, ShieldCheck, MapPinOff,
  Wand2, RefreshCw,
};

export function ToolIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Wand2;
  return <Icon className={className} aria-hidden="true" />;
}
