import React, { useEffect, useState } from 'react';
import { NamedLink, PrimaryButton } from '../../../../components';
import css from './CountdownTimer.module.css';

const LAUNCH_DATE = new Date('2026-06-26T00:00:00');

const getTimeLeft = () => {
  const diff = LAUNCH_DATE - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

const pad = n => String(n).padStart(2, '0');

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!timeLeft) return null;

  const { days, hours, minutes, seconds } = timeLeft;

  return (
    <div className={css.root}>
      <p className={css.label}>Journey begins in</p>
      <div className={css.units}>
        <div className={css.unit}>
          <span className={css.value}>{pad(days)}</span>
          <span className={css.caption}>Days</span>
        </div>
        <span className={css.separator}>:</span>
        <div className={css.unit}>
          <span className={css.value}>{pad(hours)}</span>
          <span className={css.caption}>Hours</span>
        </div>
        <span className={css.separator}>:</span>
        <div className={css.unit}>
          <span className={css.value}>{pad(minutes)}</span>
          <span className={css.caption}>Mins</span>
        </div>
        <span className={css.separator}>:</span>
        <div className={css.unit}>
          <span className={css.value}>{pad(seconds)}</span>
          <span className={css.caption}>Secs</span>
        </div>
      </div>
      <NamedLink name="SignupPage" className={css.signupLink}>
        <PrimaryButton className={css.signupButton}>Sign Up</PrimaryButton>
      </NamedLink>
    </div>
  );
};

export default CountdownTimer;
