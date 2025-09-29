// components/PageTitle.jsx
import { Helmet } from 'react-helmet-async';

const PageTitle = ({ title }) => {
  return (
    <Helmet>
      <title>{title} - SJWrites</title>
    </Helmet>
  );
};

export default PageTitle;