from unittest import TestCase
from collections.abc import Callable # https://docs.python.org/3/library/collections.abc.html#collections.abc.Callable
from requests import get, post, put, delete

# adapted from test_req_utils
# credit Dr. Newman, SWEN610 

def test_http_req(test: TestCase, url: str, params: dict={}, json: dict={}, header: dict={}, expected_status=200, method: Callable=get):
  res = method(url, params=params, json=json, headers=header)
  test.assertEqual(res.status_code, expected_status, f'Expected status of {expected_status}')
  # Assumption: all responses from server will be JSON by default
  return res.json()

def test_get(test: TestCase, url: str, params: dict={}, json: dict={}, header: dict={}, expected_status=200):
  return test_http_req(test, url, params, json, header, expected_status)

def test_post(test: TestCase, url: str, params: dict={}, json: dict={}, header: dict={}, expected_status=200):
  return test_http_req(test, url, params, json, header, expected_status, post)

def test_put(test: TestCase, url: str, params: dict={}, json: dict={}, header: dict={}, expected_status=200):
  return test_http_req(test, url, params, json, header, expected_status, put)

def test_delete(test: TestCase, url: str, params: dict={}, json: dict={}, header: dict={}, expected_status=200):
  return test_http_req(test, url, params, json, header, expected_status, delete)
  