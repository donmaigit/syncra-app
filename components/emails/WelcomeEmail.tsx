import * as React from 'react';

interface WelcomeEmailProps {
  email: string;
  texts: {
    title: string;
    body1: string;
    body2: string;
    body3: string;
    signoff: string;
  };
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ email, texts }) => (
  <div style={{ fontFamily: 'sans-serif', padding: '20px', color: '#333' }}>
    <h1 style={{ color: '#9333ea' }}>{texts.title}</h1>
    <p>{texts.body1}</p>
    <p>{texts.body2} <strong>{email}</strong>.</p>
    <p>{texts.body3}</p>
    <br />
    <p>{texts.signoff}</p>
  </div>
);