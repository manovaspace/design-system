import type * as React from "react";

import {
  Avatar as PrimitiveAvatar,
  AvatarFallback as PrimitiveAvatarFallback,
  AvatarImage as PrimitiveAvatarImage,
  avatarVariants,
} from "./primitives/avatar.js";

export type AvatarProps = React.ComponentProps<typeof PrimitiveAvatar>;

export {
  PrimitiveAvatar as Avatar,
  PrimitiveAvatarFallback as AvatarFallback,
  PrimitiveAvatarImage as AvatarImage,
  avatarVariants,
};
