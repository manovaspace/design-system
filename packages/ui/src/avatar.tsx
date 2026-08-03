import type * as React from "react";

import {
  avatarVariants,
  Avatar as PrimitiveAvatar,
  AvatarFallback as PrimitiveAvatarFallback,
  AvatarImage as PrimitiveAvatarImage,
} from "./primitives/avatar.js";

export type AvatarProps = React.ComponentProps<typeof PrimitiveAvatar>;

export {
  avatarVariants,
  PrimitiveAvatar as Avatar,
  PrimitiveAvatarFallback as AvatarFallback,
  PrimitiveAvatarImage as AvatarImage,
};
