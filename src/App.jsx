/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import './App.scss';

import classNames from 'classnames';
import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const products = productsFromServer.map(product => {
  const category = categoriesFromServer.find(
    cat => cat.id === product.categoryId,
  ); // find by product.categoryId

  const user = usersFromServer.find(person => person.id === category.ownerId); // find by category.ownerId

  return {
    ...product,
    category,
    owner: user,
  };
});

function getFilteredProducts(
  currentProducts,
  userId,
  query,
  selectedCategory,
  sortBy,
  sortOrder,
) {
  let filteredProducts = [...currentProducts];

  if (userId !== null) {
    filteredProducts = filteredProducts.filter(
      product => product.category.ownerId === userId,
    );
  }

  if (query !== '') {
    const normalizeQuery = query.trim().toLowerCase();

    filteredProducts = filteredProducts.filter(product => {
      return product.name.toLowerCase().includes(normalizeQuery);
    });
  }

  if (selectedCategory.length > 0) {
    filteredProducts = filteredProducts.filter(product => {
      return selectedCategory.includes(product.category.id);
    });
  }

  if (sortBy && sortOrder) {
    switch (sortBy) {
      case 'id':
        filteredProducts.sort((a, b) => a.id - b.id);

        if (sortOrder === 'desc') {
          filteredProducts.reverse();
        }

        break;

      case 'product':
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));

        if (sortOrder === 'desc') {
          filteredProducts.reverse();
        }

        break;

      case 'category':
        filteredProducts.sort((a, b) => {
          return a.category.title.localeCompare(b.category.title);
        });

        if (sortOrder === 'desc') {
          filteredProducts.reverse();
        }

        break;

      case 'user':
        filteredProducts.sort((a, b) => {
          return a.owner.name.localeCompare(b.owner.name);
        });

        if (sortOrder === 'desc') {
          filteredProducts.reverse();
        }

        break;

      default:
        throw new Error(`unexpected field`);
    }
    // filteredProducts.sort((product1, product2) => {
    //   switch (sortBy) {
    //     case 'id':

    //   }
    // });
  }

  return filteredProducts;
}

export const App = () => {
  const [activeUserId, setActiveUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedCategories, setSelectedCategories] = useState([]);

  const [sortBy, setSortBy] = useState(null); // 'id', 'product', 'category', 'user'
  const [sortOrder, setSortOrder] = useState(null); // 'asc', 'desc', or null

  const getSelectedCategories = categoryId => {
    setSelectedCategories(currentCategories => {
      return currentCategories.includes(categoryId)
        ? currentCategories.filter(id => id !== categoryId)
        : [...currentCategories, categoryId];
    });
  };

  const handleSort = column => {
    if (sortBy !== column) {
      setSortBy(column);
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else if (sortOrder === 'desc') {
      setSortBy(null);
      setSortOrder(null);
    }
  };

  const visibleProducts = getFilteredProducts(
    products,
    activeUserId,
    searchQuery,
    selectedCategories,
    sortBy,
    sortOrder,
  );

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                className={classNames(activeUserId === null ? 'is-active' : '')}
                onClick={() => setActiveUserId(null)}
              >
                All
              </a>

              {usersFromServer.map(user => (
                <a
                  key={user.id}
                  data-cy="FilterUser"
                  href="#/"
                  className={classNames(
                    activeUserId === user.id ? 'is-active' : '',
                  )}
                  onClick={() => setActiveUserId(user.id)}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={event => setSearchQuery(event.target.value)}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                <span className="icon is-right">
                  {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                  {searchQuery && (
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setSearchQuery('')}
                    />
                  )}
                </span>
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={`button is-success mr-6 ${selectedCategories.length ? 'is-outlined' : ''}`}
                onClick={() => setSelectedCategories([])}
              >
                All
              </a>

              {categoriesFromServer.map(cat => (
                <a
                  key={cat.id}
                  data-cy="Category"
                  className={`button mr-2 my-1 ${selectedCategories.includes(cat.id) ? 'is-info' : ''}`}
                  href="#/"
                  onClick={() => getSelectedCategories(cat.id)}
                >
                  {cat.title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={() => {
                  setActiveUserId(null);
                  setSearchQuery('');
                }}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {visibleProducts.length === 0 ? (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          ) : (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      ID
                      <a href="#/" onClick={() => handleSort('id')}>
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={classNames('fas', {
                              'fa-sort': sortBy !== 'id',
                              'fa-sort-up':
                                sortBy === 'id' && sortOrder === 'asc',
                              'fa-sort-down':
                                sortBy === 'id' && sortOrder === 'desc',
                            })}
                          />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      Product
                      <a href="#/" onClick={() => handleSort('product')}>
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={classNames('fas', {
                              'fa-sort': sortBy !== 'product',
                              'fa-sort-up':
                                sortBy === 'product' && sortOrder === 'asc',
                              'fa-sort-down':
                                sortBy === 'product' && sortOrder === 'desc',
                            })}
                          />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      Category
                      <a href="#/" onClick={() => handleSort('category')}>
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={classNames('fas', {
                              'fa-sort': sortBy !== 'category',
                              'fa-sort-up':
                                sortBy === 'category' && sortOrder === 'asc',
                              'fa-sort-down':
                                sortBy === 'category' && sortOrder === 'desc',
                            })}
                          />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      User
                      <a href="#/" onClick={() => handleSort('user')}>
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={classNames('fas', {
                              'fa-sort': sortBy !== 'user',
                              'fa-sort-up':
                                sortBy === 'user' && sortOrder === 'asc',
                              'fa-sort-down':
                                sortBy === 'user' && sortOrder === 'desc',
                            })}
                          />
                        </span>
                      </a>
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleProducts.map(product => (
                  <tr data-cy="Product" key={product.id}>
                    <td className="has-text-weight-bold" data-cy="ProductId">
                      {product.id}
                    </td>

                    <td data-cy="ProductName">{product.name}</td>

                    <td data-cy="ProductCategory">
                      {product.category.icon} - {product.category.title}
                    </td>

                    <td
                      data-cy="ProductUser"
                      className={classNames(
                        product.owner.sex === 'm'
                          ? 'has-text-link'
                          : 'has-text-danger',
                      )}
                    >
                      {product.owner.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
