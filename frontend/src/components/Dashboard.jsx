import React, { useState } from "react";
import { Input, Layout, Card, Alert, Pagination, Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { DownCircleOutlined, UpCircleOutlined } from '@ant-design/icons';
import { Spin } from 'antd';

const { Header, Footer, Content } = Layout;
const { Search } = Input;

const headerStyle = {
  textAlign: 'center',
  color: '#fff',
  height: 64,
  paddingInline: 48,
  lineHeight: '64px',
  backgroundColor: '#001529',
  fontSize: 24,
};

const contentStyle = {
  display: 'flex',

  alignItems: 'center',
  flexDirection: 'column',
  minHeight: '80vh',
  padding: '24px',
  textAlign: 'center',
};

const footerStyle = {
  textAlign: 'center',
  color: '#fff',
  backgroundColor: '#001529',
  padding: '12px 0',
};

const layoutStyle = {
  overflow: 'hidden',
  width: '100%',
  minHeight: '100vh',
};

function Dashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedAbstracts, setExpandedAbstracts] = useState({});
  const [position, setPosition] = useState('start');
  const pageSize = 10; // Number of results per page

  const onSearch = async (value) => {
    setData(null);
    setError(null);
    setIsLoading(true);
    setCurrentPage(1); // Reset to the first page on new search

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/search?q=${value}&offset=0&limit=${pageSize}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      setData(result);
      setTotalCount(result.count); // Set total count from response
    } catch (error) {
      setError("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = async (page) => {
    setIsLoading(true);
    setCurrentPage(page);

    const offset = (page - 1) * pageSize; // Calculate offset based on page
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/search?q=${data.search_query}&offset=${offset}&limit=${pageSize}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      setError("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle abstract visibility
  const toggleAbstract = (index) => {
    setExpandedAbstracts((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const abstractDefaultLength = 50
  // Helper function to get the first 50 words
  const getFirstNWords = (text) => {
    return text.split(" ").slice(0, abstractDefaultLength).join(" ");
  };

  return (
    <Layout style={layoutStyle}>
      <Header style={headerStyle}>Literature Sources Search & Summary</Header>

      <Content style={contentStyle}>
        <Search
          id="search-input"
          size="large"
          placeholder="Search articles, papers, or keywords..."
          allowClear
          onSearch={onSearch}
          enterButton
          style={{ maxWidth: 900, width: '100%', marginBottom: 24 }}
        />
        {isLoading && (
          <Spin
            indicator={
              <LoadingOutlined style={{ fontSize: 48 }} spin />
            }
          />
        )}
        {error && (
          <Alert message="Error" description={error} type="error" showIcon style={{ marginBottom: 24 }} />
        )}
        {data && (
          <div>
            <Card
              title="OpenAI Summary"
              bordered={false}
              style={{ maxWidth: 900, marginBottom: 24 }}
            >
              {data.summary}
            </Card>

            <h3>{data.count} Result{data.count !== 1 ? 's' : ''} Found</h3>

            {totalCount > pageSize && ( // Show pagination if total results are more than page size
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalCount}
                onChange={handlePageChange}
                style={{
                  marginTop: 16, marginBottom: 16, display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              />
            )}
            {data.data.map((item, index) => (
              <Card
                title={item.title}
                bordered={false}
                key={index}
                style={{ maxWidth: 900, width: "100%", marginBottom: 16 }}
              >
                {new Date(item.publication_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}

                {/* Only show possibility to extend abstract if its's longer than set amount of words */}
                <p>
                  {item.abstract.split(' ').length > abstractDefaultLength
                    ? (expandedAbstracts[index] ? item.abstract : `${getFirstNWords(item.abstract)}...`)
                    : item.abstract}
                </p>

                {item.abstract.split(' ').length > abstractDefaultLength && (
                  <Button
                    icon={expandedAbstracts[index] ? <UpCircleOutlined /> : <DownCircleOutlined />}
                    iconPosition={position}
                    onClick={() => toggleAbstract(index)}
                  >
                    {expandedAbstracts[index] ? "Show less" : "Show full abstract"}
                  </Button>)}
            </Card>
            ))}
            {totalCount > pageSize && ( // Show pagination if total results are more than page size
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalCount}
                onChange={handlePageChange}
                style={{
                  marginTop: 16, marginBottom: 16, display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              />
            )}
          </div>
        )}
      </Content>
      <Footer style={footerStyle}>© 2024 Elizaveta Ragozina</Footer>
    </Layout>
  );
}

export default Dashboard;
