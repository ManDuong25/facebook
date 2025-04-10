import React from "react";
import { useParams } from "react-router";

const RouteWrapper = ({ component: Component, layout: Layout }) => {
  // Không sử dụng loading delay nữa để tránh chớp nháy
  return Layout ? (
    <Layout>
      <Component />
    </Layout>
  ) : (
    <Component />
  );
};

export default RouteWrapper;
