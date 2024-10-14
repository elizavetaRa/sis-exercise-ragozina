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

const PAGE_SIZE = 10; // Number of results per page
const ABSTRACT_DEFAULT_LENGTH = 50; // Number of words to show initially for the abstracts
const ICON_POSITION = 'start'

function Dashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedAbstracts, setExpandedAbstracts] = useState({});

  const makeSearchRequest = async (searchValue, offset) => {
    setIsLoading(true);

    try {
      const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/search?q=${searchValue}&offset=${offset}&limit=${PAGE_SIZE}`
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
  }

  const onSearch = async (value) => {
    if (value) {
      onSearchClear() // clear search related data

      await makeSearchRequest(value, 0)
    }
  };

  // Handle search clear event
  const onSearchClear = () => {
    setData(null);
    setError(null);
    setCurrentPage(1);
    setExpandedAbstracts({});
  };

  const handlePageChange = async (page) => {
    setCurrentPage(page);

    const offset = (page - 1) * PAGE_SIZE; // Calculate offset based on page
    makeSearchRequest(data.search_query, offset)
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
    return text.split(" ").slice(0, ABSTRACT_DEFAULT_LENGTH).join(" ");
  };

  const totalCount = data?.count

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
          onClear={onSearchClear}
          aria-label="Search for articles, papers, or keywords"
        />
        {isLoading && (
          <Spin
            indicator={
              <LoadingOutlined style={loadingSpinnerStyle} spin />
            }
            aria-live="polite" // Announce loading status
          />
        )}
        {error && (
          <Alert message="Error" description={error} type="error" showIcon style={errorAlertStyle} />
        )}
        {data && (
          <div style={cardsContainerStyle}>
            {data.summary && (<Card
              bordered={false}
              style={cardStyle}
            >
              <Card.Meta
                avatar={<Avatar style={avatarStyle} src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/ChatGPT-Logo.svg/180px-ChatGPT-Logo.svg.png" />}
                title="OpenAI Summary"
                style={cardMetaStyle}
              />
              {data.summary[1][1][0][3][1][0][1]}
            </Card>)}

            {data && data.count !== undefined && (
              <h3>
                {data.count} Result{data.count !== 1 ? 's' : ''} Found
              </h3>
            )}

            {!!totalCount && (totalCount > PAGE_SIZE) && ( // Show pagination if total results are more than page size
              <Pagination
                current={currentPage}
                pageSizeOptions={[PAGE_SIZE]}
                total={totalCount}
                onChange={handlePageChange}
                style={paginationStyle}
                aria-label="Pagination controls"
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
                    {item.abstract.split(' ').length > ABSTRACT_DEFAULT_LENGTH
                      ? (expandedAbstracts[index] ? item.abstract : `${getFirstNWords(item.abstract)}...`)
                      : item.abstract}
                  </p>
                {item.abstract.split(' ').length > ABSTRACT_DEFAULT_LENGTH && (
                  <Button
                    icon={expandedAbstracts[index] ? <UpCircleOutlined /> : <DownCircleOutlined />}
                    iconPosition={ICON_POSITION}
                    onClick={() => toggleAbstract(index)}
                    aria-expanded={expandedAbstracts[index]}
                  >
                    {expandedAbstracts[index] ? "Show less" : "Show full abstract"}
                  </Button>
                )}
              </Card>
            ))}
            {!!totalCount && (totalCount > PAGE_SIZE) && ( // Show pagination if total results are more than page size
              <Pagination
                current={currentPage}
                pageSizeOptions={[PAGE_SIZE]}
                total={totalCount}
                onChange={handlePageChange}
                style={paginationStyle}
                aria-label="Pagination controls"
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