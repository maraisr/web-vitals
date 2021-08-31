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

--~ By pagename
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
