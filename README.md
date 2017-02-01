# sql2table
Purpose: analyse sql commands, provide alerts for posible wrong/mismatched values.
Usage: 
  - Upload sql files onto web, or input command line by line;
  - Selector type 1 will filter data(statement array);
  - Selector type 2 will selectively show needed columns base on whatever shown on web(no touching array);
    all values of the specific column(by selector 2) would be used to generate popular-types(just to guess one expected format of value for that column),
    then score will be calculated by comparing individual values' types with popular-types,
    then distance will be calculated base on scores,
    then distanceLevel will be calculated to trigger alert to show on UI
(e.g. among values like 'abc', 'def' and '123', alert will be triggerd for '123' since it doesn't fit the major format)

Comment: not completed, to do if possible: drag/drop to upload; show alert after uploading; modify sql on page; save as sql file to local.
