import React from 'react';

const ClinicLogo = ({ className = '', size = 32 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Clinic CRM</title>
      <path 
        d="M28,9V3L27,2H5L4,3V9l1,1H7.18l-3,4.78L4,15.32V29l1,1H27l1-1V15.32l-.16-.54-3-4.78H27Zm-2,6.61V28H6V15.61L9.55,10h12.9ZM26,8H6V4H26Z"
        className="text-gray-900"
        fill="currentColor"
      />
      <path 
        d="M26,15.61V28H24V15.32l-.16-.54L20.82,10h1.63L26,15.61Z"
        className="text-primary-600"
        fill="currentColor"
      />
      <path 
        d="M26,4v4H24V4Z"
        className="text-primary-600"
        fill="currentColor"
      />
      <path 
        d="M15,23h2V20.5h2.5v-2H17V16H15v2.5H12.5v2H15Z"
        className="text-gray-900"
        fill="currentColor"
      />
    </svg>
  );
};

export default ClinicLogo; 