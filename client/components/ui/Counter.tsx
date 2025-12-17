'use client';

import { useAppSelector, useAppDispatch } from '@/client/store/hooks';
import { increment, decrement } from '@/client/store/slices/counterSlice';

export function Counter() {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();

  return (
    <div>
      <button onClick={() => dispatch(decrement())}>-</button>
      <span>{count}</span>
      <button onClick={() => dispatch(increment())}>+</button>
    </div>
  );
}