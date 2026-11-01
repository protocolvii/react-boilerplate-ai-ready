import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '../ui/breadcrumb';
const BreadcrumbCom = ({ data = [] }) => (
  <Breadcrumb>
    <BreadcrumbList>
      {data.map((item, i) => (
        <React.Fragment key={`${item.name}-${i}`}>
          {i > 0 && <BreadcrumbSeparator />}
          <BreadcrumbItem>
            {item.link && i < data.length - 1 ? (
              <BreadcrumbLink asChild>
                <Link to={item.link}>{item.name}</Link>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage>{item.name}</BreadcrumbPage>
            )}
          </BreadcrumbItem>
        </React.Fragment>
      ))}
    </BreadcrumbList>
  </Breadcrumb>
);
export default BreadcrumbCom;
