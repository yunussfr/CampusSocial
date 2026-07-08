import React from 'react';
import Svg, {Path} from 'react-native-svg';

export function MdiIcon({
  path,
  size = 24,
  color = '#64748B',
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24">
      <Path d={path} fill={color} />
    </Svg>
  );
}
