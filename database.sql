--~ Table
create table metrics
(
    id         uuid                     default uuid_generate_v4()           not null
        constraint metrics_pkey
            primary key,
    site       text                                                          not null,
    pathname   varchar                                                       not null,
    name       varchar                                                       not null,
    value      double precision                                              not null,
    browser    text                                                          not null,
    os         text                                                          not null,
    device     text                                                          not null,
    country    varchar                                                       not null,
    event_id   varchar,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    hostname   varchar                                                       not null
);

--~ Indices
create index metrics_site_name_idx
    on metrics (site, name);

create index metrics_site_created_at_idx
    on metrics (site, created_at);

--~ Functions
create
    or replace function get_agg_overview(lower_bound text, upper_bound text)
    returns table
            (
                site     varchar,
                device   varchar,
                name     varchar,
                end_time timestamp,
                p75      float,
                p95      float,
                p98      float
            )
    language plpgsql
as
$$
begin
    return query
        select m.site::varchar,
               m.device::varchar,
               m.name::varchar,
               to_timestamp(floor((extract('epoch' from created_at) / 3600)) * 3600) at time zone 'UTC' as end_time,
               percentile_disc(0.75) within group ( order by value)                                   as p75,
               percentile_disc(0.95) within group ( order by value)                                   as p95,
               percentile_disc(0.98) within group ( order by value)                                   as p98
        FROM metrics m
        where m.created_at >= lower_bound::timestamp
          and m.created_at < upper_bound::timestamp
        group by m.site, m.device, m.name, end_time
        order by end_time desc;
end;
$$;

create
    or replace function get_agg_by_pagename(lower_bound text, upper_bound text)
    returns table
            (
                site          varchar,
                device        varchar,
                name          varchar,
                pathname      varchar,
                pathname_hash varchar,
                end_time      timestamp,
                p75           float,
                p95           float,
                p98           float
            )
    language plpgsql
as
$$
begin
    return query
        select m.site::varchar,
               m.device::varchar,
               m.name::varchar,
               m.pathname::varchar,
               md5(m.pathname)::varchar                                                               as pathname_hash,
               to_timestamp(floor((extract('epoch' from created_at) / 3600)) * 3600) at time zone 'UTC' as end_time,
               percentile_disc(0.75) within group ( order by value)                                   as p75,
               percentile_disc(0.95) within group ( order by value)                                   as p95,
               percentile_disc(0.98) within group ( order by value)                                   as p98
        FROM metrics m
        where m.created_at >= lower_bound::timestamp
          and m.created_at < upper_bound::timestamp
        group by m.site, m.pathname, m.device, m.name, end_time
        order by end_time desc;
end;
$$;
