/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Internal dependencies
 */
import { ANIMATION_TYPES, ROTATION } from '../../constants';
import SimpleAnimation from '../simpleAnimation';

const defaults = {
  fill: 'forwards',
  duration: 1000,
};

const keyframesLookup = {
  [ROTATION.CLOCKWISE]: {
    transform: ['rotateZ(0deg)', 'rotateZ(360deg)'],
  },
  [ROTATION.COUNTER_CLOCKWISE]: {
    transform: ['rotateZ(0deg)', 'rotateZ(-360deg)'],
  },
  [ROTATION.PING_PONG]: {
    transform: ['rotateZ(-45deg)', 'rotateZ(45deg)'],
  },
};

export function AnimationSpin({ rotation = ROTATION.CLOCKWISE, ...args }) {
  const timings = {
    ...defaults,
    ...args,
  };

  const animationName = `rot-${rotation}-${ANIMATION_TYPES.SPIN}`;
  const keyframes = keyframesLookup[rotation];

  const { id, WAAPIAnimation, AMPTarget, AMPAnimation } = SimpleAnimation(
    animationName,
    keyframes,
    timings
  );

  return {
    id,
    WAAPIAnimation,
    AMPTarget,
    AMPAnimation,
    generatedKeyframes: {
      [animationName]: keyframes,
    },
  };
}
