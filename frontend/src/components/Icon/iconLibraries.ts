// Static icon imports - only import the specific icons used in the app
import type { ComponentType } from 'react'

import { IoMdImages } from 'react-icons/io'
import {
  BiChevronLeft,
  BiChevronRight,
  BiChevronsLeft,
  BiChevronsRight,
  BiChevronsUp,
} from 'react-icons/bi'
import { IoSettingsSharp } from 'react-icons/io5'
import { FaAnglesUp } from 'react-icons/fa6'
import {
  MdOutlineFilter3,
  MdOutlineFilter4,
  MdOutlineFilter5,
  MdOutlineFilter6,
  MdOutlineFilter7,
  MdOutlineFilter8,
  MdOutlineFilter9,
  MdOutlineFilter9Plus,
  MdOutlineSettingsBackupRestore,
  MdOutlineCircle,
  MdSave,
  MdInfo,
} from 'react-icons/md'
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
import { TiDeleteOutline } from 'react-icons/ti'
import { ImBlocked, ImEyeBlocked } from 'react-icons/im'
import { RiMailSendLine } from 'react-icons/ri'

export type IconLibrariesShape = Record<
  string,
  Record<string, ComponentType<Record<string, unknown>>>
>

export const iconLibraries = {
  io: {
    IoMdImages,
  },
  bi: {
    BiChevronLeft,
    BiChevronRight,
    BiChevronsLeft,
    BiChevronsRight,
    BiChevronsUp,
  },
  io5: {
    IoSettingsSharp,
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
  },
  md: {
    MdOutlineFilter3,
    MdOutlineFilter4,
    MdOutlineFilter5,
    MdOutlineFilter6,
    MdOutlineFilter7,
    MdOutlineFilter8,
    MdOutlineFilter9,
    MdOutlineFilter9Plus,
    MdOutlineSettingsBackupRestore,
    MdOutlineCircle,
    MdInfo,
    MdSave,
  },
  ti: {
    TiDeleteOutline,
  },
  im: {
    ImBlocked,
    ImEyeBlocked,
  },
  ri: {
    RiMailSendLine,
  },
} as const satisfies IconLibrariesShape
