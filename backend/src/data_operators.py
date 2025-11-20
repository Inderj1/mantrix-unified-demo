"""
Data Operators Module
Provides utility functions for data manipulation and operations
"""

import pandas as pd
from typing import List, Optional


class DataOperator:
    """
    Data operation utilities for working with pandas DataFrames
    """

    def __init__(self):
        """Initialize DataOperator"""
        pass

    def vlookup(
        self,
        left_df: pd.DataFrame,
        left_key: str,
        right_df: pd.DataFrame,
        right_key: str,
        return_columns: List[str],
        how: str = 'left'
    ) -> pd.DataFrame:
        """
        Perform a VLOOKUP-like operation (similar to Excel VLOOKUP)

        Args:
            left_df: Left DataFrame
            left_key: Column name to use as key in left DataFrame
            right_df: Right DataFrame (lookup table)
            right_key: Column name to use as key in right DataFrame
            return_columns: List of column names to return from right DataFrame
            how: Type of join ('left', 'right', 'inner', 'outer')

        Returns:
            DataFrame with merged results
        """
        # Select only the columns we need from the right DataFrame
        right_subset = right_df[[right_key] + return_columns].copy()

        # Perform the merge
        result = left_df.merge(
            right_subset,
            left_on=left_key,
            right_on=right_key,
            how=how,
            suffixes=('', '_lookup')
        )

        return result

    def hlookup(
        self,
        left_df: pd.DataFrame,
        left_key: str,
        right_df: pd.DataFrame,
        right_key: str,
        return_row_index: int,
        how: str = 'left'
    ) -> pd.DataFrame:
        """
        Perform a HLOOKUP-like operation (horizontal lookup)

        Args:
            left_df: Left DataFrame
            left_key: Column name to use as key in left DataFrame
            right_df: Right DataFrame (lookup table, transposed)
            right_key: Row index to use as key in right DataFrame
            return_row_index: Row index to return from right DataFrame
            how: Type of join

        Returns:
            DataFrame with merged results
        """
        # Transpose the right DataFrame for horizontal lookup
        right_transposed = right_df.T

        # Use the first row as column names
        right_transposed.columns = right_transposed.iloc[right_key]

        # Get the lookup value from the specified row
        lookup_series = right_transposed.iloc[return_row_index]

        # Convert to DataFrame for merging
        lookup_df = pd.DataFrame(lookup_series).reset_index()
        lookup_df.columns = ['key', 'value']

        # Merge with left DataFrame
        result = left_df.merge(
            lookup_df,
            left_on=left_key,
            right_on='key',
            how=how
        )

        return result

    def sumif(
        self,
        df: pd.DataFrame,
        condition_column: str,
        condition_value,
        sum_column: str
    ) -> float:
        """
        Perform a SUMIF-like operation (sum values based on condition)

        Args:
            df: DataFrame
            condition_column: Column to apply condition on
            condition_value: Value to match
            sum_column: Column to sum

        Returns:
            Sum of values matching the condition
        """
        filtered_df = df[df[condition_column] == condition_value]
        return filtered_df[sum_column].sum()

    def countif(
        self,
        df: pd.DataFrame,
        condition_column: str,
        condition_value
    ) -> int:
        """
        Perform a COUNTIF-like operation (count rows based on condition)

        Args:
            df: DataFrame
            condition_column: Column to apply condition on
            condition_value: Value to match

        Returns:
            Count of rows matching the condition
        """
        return (df[condition_column] == condition_value).sum()

    def pivot_table(
        self,
        df: pd.DataFrame,
        index: List[str],
        columns: Optional[List[str]] = None,
        values: Optional[List[str]] = None,
        aggfunc: str = 'sum'
    ) -> pd.DataFrame:
        """
        Create a pivot table

        Args:
            df: DataFrame
            index: Columns to use as row index
            columns: Columns to use as column index
            values: Columns to aggregate
            aggfunc: Aggregation function

        Returns:
            Pivot table DataFrame
        """
        return pd.pivot_table(
            df,
            index=index,
            columns=columns,
            values=values,
            aggfunc=aggfunc
        )

    def unpivot(
        self,
        df: pd.DataFrame,
        id_vars: List[str],
        value_vars: List[str],
        var_name: str = 'variable',
        value_name: str = 'value'
    ) -> pd.DataFrame:
        """
        Unpivot (melt) a DataFrame from wide to long format

        Args:
            df: DataFrame
            id_vars: Columns to keep as identifier variables
            value_vars: Columns to unpivot
            var_name: Name for variable column
            value_name: Name for value column

        Returns:
            Unpivoted DataFrame
        """
        return pd.melt(
            df,
            id_vars=id_vars,
            value_vars=value_vars,
            var_name=var_name,
            value_name=value_name
        )

    def filter_df(
        self,
        df: pd.DataFrame,
        conditions: dict
    ) -> pd.DataFrame:
        """
        Filter DataFrame based on multiple conditions

        Args:
            df: DataFrame
            conditions: Dictionary of {column: value} conditions

        Returns:
            Filtered DataFrame
        """
        result = df.copy()

        for column, value in conditions.items():
            if isinstance(value, list):
                result = result[result[column].isin(value)]
            else:
                result = result[result[column] == value]

        return result

    def deduplicate(
        self,
        df: pd.DataFrame,
        subset: Optional[List[str]] = None,
        keep: str = 'first'
    ) -> pd.DataFrame:
        """
        Remove duplicate rows

        Args:
            df: DataFrame
            subset: Columns to consider for identifying duplicates
            keep: Which duplicates to keep ('first', 'last', False)

        Returns:
            DataFrame without duplicates
        """
        return df.drop_duplicates(subset=subset, keep=keep)
