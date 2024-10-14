import React, { useState } from "react";
import { Spin, Input, Layout, Card, Alert, Pagination, Button, Avatar } from 'antd';
import { LoadingOutlined, DownCircleOutlined, UpCircleOutlined } from '@ant-design/icons';
import {
  headerStyle,
  contentStyle,
  footerStyle,
  layoutStyle,
  searchStyle,
  cardMetaStyle,
  paginationStyle,
  avatarStyle,
  cardStyle,
  cardsContainerStyle,
  loadingSpinnerStyle,
  errorAlertStyle
} from './styles';

const { Header, Footer, Content } = Layout;
const { Search } = Input;

function Dashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedAbstracts, setExpandedAbstracts] = useState({});
  const [position, setPosition] = useState('start');
  const pageSize = 10; // Number of results per page
  const abstractDefaultLength = 50; // Number of words to show initially for the abstracts

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
          style={searchStyle}
        />
        {isLoading && (
          <Spin
            indicator={
              <LoadingOutlined style={loadingSpinnerStyle} spin />
            }
          />
        )}
        {error && (
          <Alert message="Error" description={error} type="error" showIcon style={errorAlertStyle} />
        )}
        {data && (
          <div style={cardsContainerStyle}>
            <Card
              bordered={false}
              style={cardStyle}
            >
              <Card.Meta
                avatar={<Avatar style={avatarStyle} src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/ChatGPT-Logo.svg/180px-ChatGPT-Logo.svg.png" />}
                title="OpenAI Summary"
                style={cardMetaStyle}
              />
              {data.summary}
            </Card>

            <h3>{data.count} Result{data.count !== 1 ? 's' : ''} Found</h3>

            {totalCount > pageSize && ( // Show pagination if total results are more than page size
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalCount}
                onChange={handlePageChange}
                style={paginationStyle}
              />
            )}
            {data.data.map((item, index) => (
              <Card
                title={item.title}
                bordered={false}
                key={index}
                style={cardStyle}
              >
                {new Date(item.publication_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}

                {/* Only show possibility to extend abstract if it's longer than set amount of words */}
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
                  </Button>
                )}
              </Card>
            ))}
            {totalCount > pageSize && ( // Show pagination if total results are more than page size
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalCount}
                onChange={handlePageChange}
                style={paginationStyle}
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
