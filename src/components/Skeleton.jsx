import React from 'react';

const Shimmer = () => (
  <style>
    {`
      @keyframes shimmer {
        0% { background-position: -468px 0; }
        100% { background-position: 468px 0; }
      }
      .skeleton {
        background: #f6f7f8;
        background-image: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
        background-repeat: no-repeat;
        background-size: 800px 104px; 
        display: inline-block;
        position: relative;
        animation: shimmer 1s linear infinite forwards;
      }
    `}
  </style>
);

export const ProductCardSkeleton = () => (
  <div style={{ padding: '1.2rem', borderRadius: '32px', background: 'white', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>
    <Shimmer />
    <div className="skeleton" style={{ width: '100%', height: '240px', borderRadius: '24px' }} />
    <div style={{ marginTop: '1.5rem', flex: 1 }}>
      <div className="skeleton" style={{ width: '40%', height: '12px', borderRadius: '4px', marginBottom: '0.8rem' }} />
      <div className="skeleton" style={{ width: '90%', height: '20px', borderRadius: '4px', marginBottom: '1rem' }} />
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
        <div className="skeleton" style={{ width: '30%', height: '24px', borderRadius: '4px' }} />
        <div className="skeleton" style={{ width: '44px', height: '44px', borderRadius: '18px' }} />
      </div>
    </div>
  </div>
);

export const ProductDetailsSkeleton = () => (
  <div className="container" style={{ padding: '2rem 0' }}>
     <Shimmer />
     <div className="skeleton" style={{ width: '100px', height: '24px', marginBottom: '2rem' }} />
     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
        <div className="skeleton" style={{ width: '100%', height: '450px', borderRadius: '24px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="skeleton" style={{ width: '20%', height: '24px', borderRadius: '15px' }} />
            <div className="skeleton" style={{ width: '80%', height: '40px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '40%', height: '32px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '100%', height: '100px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '100%', height: '60px', borderRadius: '4px' }} />
        </div>
     </div>
  </div>
);
