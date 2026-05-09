// Static icon imports - only import the specific icons used in the app
import type { ComponentType } from 'react'
import {
  RiHomeSmileLine,
  RiMailSendLine,
  RiDeleteBin2Line,
  RiDragMove2Fill,
  RiDragDropLine,
  RiTodoLine,
  RiFileList3Line,
} from 'react-icons/ri'
import {
  BsPerson,
  BsCart2,
  BsMusicNoteBeamed,
  BsArrowDownCircleFill,
  BsArrowBarRight,
  BsArrowBarLeft,
} from 'react-icons/bs'
import {
  IoMdImages,
  IoMdAdd,
  IoMdCheckmarkCircleOutline,
  IoMdColorPalette,
} from 'react-icons/io'
import {
  BiChat,
  BiChevronsUp,
  BiChevronsDown,
  BiReset,
  BiSelectMultiple,
  BiSolidColorFill,
  BiChevronsLeft,
  BiChevronsRight,
  BiChevronLeft,
  BiChevronRight,
  BiChevronDown,
  BiChevronUp,
  BiPlus,
  BiUndo,
  BiRedo,
  BiLaugh,
} from 'react-icons/bi'
import { CgSearch, CgUndo } from 'react-icons/cg'
import {
  IoSettingsSharp,
  IoPersonCircleSharp,
  IoCopyOutline,
  IoStopCircleOutline,
  IoPlayCircleOutline,
} from 'react-icons/io5'
import {
  HiOutlineDotsHorizontal,
  HiDotsHorizontal,
  HiDotsCircleHorizontal,
  HiMenu,
} from 'react-icons/hi'
import { HiMiniSparkles, HiArrowsPointingOut } from 'react-icons/hi2'
import { TfiLineDashed } from 'react-icons/tfi'
import {
  FaAnglesUp,
  FaTriangleExclamation,
  FaAnglesLeft,
  FaAnglesRight,
} from 'react-icons/fa6'
import {
  MdLightMode,
  MdDarkMode,
  Md123,
  MdAbc,
  MdInsertEmoticon,
  MdDragIndicator,
  MdOutlineDragIndicator,
  MdWork,
  MdOutlineQuiz,
  MdMoveUp,
  MdMoveDown,
  MdSave,
  MdContentCopy,
  MdLocationOn,
  MdOutlineFilter3,
  MdOutlineFilter4,
  MdOutlineFilter5,
  MdOutlineFilter6,
  MdOutlineFilter7,
  MdOutlineFilter8,
  MdOutlineFilter9,
  MdOutlineFilter9Plus,
  MdOutlineSettingsBackupRestore,
  MdDriveFileRenameOutline,
  MdHideSource,
  MdInvertColors,
  MdInvertColorsOff,
  MdOutlineCircle,
} from 'react-icons/md'
import {
  LuCirclePlus,
  LuArrowRightFromLine,
  LuArrowLeftFromLine,
  LuSquareDashed,
  LuLaugh,
} from 'react-icons/lu'
import { LiaUndoAltSolid, LiaNewspaperSolid } from 'react-icons/lia'
import {
  PiImage,
  PiDownloadSimpleFill,
  PiResizeLight,
  PiMouseScroll,
} from 'react-icons/pi'
import {
  FaStar,
  FaStoreAlt,
  FaWordpress,
  FaReact,
  FaNodeJs,
  FaRegCheckCircle,
  FaHourglassStart,
  FaArrowLeft,
  FaArrowRight,
  FaTimes,
  FaRandom,
  FaList,
  FaPlus,
  FaRegClone,
  FaSave,
} from 'react-icons/fa'
import { TiDeleteOutline, TiShoppingCart } from 'react-icons/ti'
import { AiOutlineEdit, AiOutlineForm, AiFillEdit } from 'react-icons/ai'
import {
  TbCancel,
  TbLayoutNavbar,
  TbCircleDashed,
  TbBlob,
  TbJoker,
} from 'react-icons/tb'
import {
  ImImages,
  ImBlocked,
  ImEyeBlocked,
  ImEnlarge2,
  ImShrink2,
  ImCamera,
} from 'react-icons/im'
import { GrGraphQl } from 'react-icons/gr'
import { GiAbstract019, GiComb, GiPartyPopper } from 'react-icons/gi'
import { SiSvgtrace } from 'react-icons/si'
import {
  GoArrowLeft,
  GoArrowRight,
  GoTriangleDown,
  GoTriangleUp,
} from 'react-icons/go'

export type IconLibrariesShape = Record<
  string,
  Record<string, ComponentType<Record<string, unknown>>>
>

export const iconLibraries = {
  ri: {
    RiHomeSmileLine,
    RiMailSendLine,
    RiDeleteBin2Line,
    RiDragMove2Fill,
    RiDragDropLine,
    RiTodoLine,
    RiFileList3Line,
  },
  bs: {
    BsPerson,
    BsCart2,
    BsMusicNoteBeamed,
    BsArrowDownCircleFill,
    BsArrowBarRight,
    BsArrowBarLeft,
  },
  io: {
    IoMdImages,
    IoMdAdd,
    IoMdCheckmarkCircleOutline,
    IoMdColorPalette,
  },
  bi: {
    BiChat,
    BiChevronsUp,
    BiChevronsDown,
    BiReset,
    BiSelectMultiple,
    BiSolidColorFill,
    BiChevronsLeft,
    BiChevronsRight,
    BiChevronLeft,
    BiChevronRight,
    BiChevronDown,
    BiChevronUp,
    BiPlus,
    BiUndo,
    BiRedo,
    BiLaugh,
  },
  cg: {
    CgSearch,
    CgUndo,
  },
  io5: {
    IoSettingsSharp,
    IoPersonCircleSharp,
    IoCopyOutline,
    IoStopCircleOutline,
    IoPlayCircleOutline,
  },
  hi: {
    HiOutlineDotsHorizontal,
    HiDotsHorizontal,
    HiDotsCircleHorizontal,
    HiMenu,
  },
  hi2: {
    HiMiniSparkles,
    HiArrowsPointingOut,
  },
  tfi: {
    TfiLineDashed,
  },
  fa: {
    FaStar,
    FaStoreAlt,
    FaWordpress,
    FaReact,
    FaNodeJs,
    FaRegCheckCircle,
    FaHourglassStart,
    FaArrowLeft,
    FaArrowRight,
    FaTimes,
    FaRandom,
    FaList,
    FaPlus,
    FaRegClone,
    FaSave,
  },
  fa6: {
    FaAnglesUp,
    FaTriangleExclamation,
    FaAnglesLeft,
    FaAnglesRight,
  },
  md: {
    MdLightMode,
    MdDarkMode,
    Md123,
    MdAbc,
    MdInsertEmoticon,
    MdDragIndicator,
    MdOutlineDragIndicator,
    MdWork,
    MdOutlineQuiz,
    MdMoveUp,
    MdMoveDown,
    MdSave,
    MdContentCopy,
    MdLocationOn,
    MdOutlineFilter3,
    MdOutlineFilter4,
    MdOutlineFilter5,
    MdOutlineFilter6,
    MdOutlineFilter7,
    MdOutlineFilter8,
    MdOutlineFilter9,
    MdOutlineFilter9Plus,
    MdOutlineSettingsBackupRestore,
    MdDriveFileRenameOutline,
    MdHideSource,
    MdInvertColors,
    MdInvertColorsOff,
    MdOutlineCircle,
  },
  lu: {
    LuCirclePlus,
    LuArrowRightFromLine,
    LuArrowLeftFromLine,
    LuSquareDashed,
    LuLaugh,
  },
  lia: {
    LiaUndoAltSolid,
    LiaNewspaperSolid,
  },
  pi: {
    PiImage,
    PiDownloadSimpleFill,
    PiResizeLight,
    PiMouseScroll,
  },
  ti: {
    TiDeleteOutline,
    TiShoppingCart,
  },
  ai: {
    AiOutlineEdit,
    AiOutlineForm,
    AiFillEdit,
  },
  tb: {
    TbCancel,
    TbLayoutNavbar,
    TbCircleDashed,
    TbBlob,
    TbJoker,
  },
  im: {
    ImImages,
    ImBlocked,
    ImEyeBlocked,
    ImEnlarge2,
    ImShrink2,
    ImCamera,
  },
  gr: {
    GrGraphQl,
  },
  gi: {
    GiAbstract019,
    GiComb,
    GiPartyPopper,
  },
  si: {
    SiSvgtrace,
  },
  go: {
    GoArrowLeft,
    GoArrowRight,
    GoTriangleDown,
    GoTriangleUp,
  },
} as const satisfies IconLibrariesShape
