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

--~ Report Function
create
    or replace function get_report(lower_bound timestamp, upper_bound timestamp)
    returns table
            (
                key      varchar,
                site     varchar,
                device   varchar,
                name     varchar,
                end_time timestamptz,
                p75      float,
                p95      float,
                p98      float
            )
    language plpgsql
as
$$
begin
    return query
        with intervals as (select (select min(created_at) + (n || 'minutes')::interval from metrics)      start_time,
                                  (select min(created_at) + (n + 60 || 'minutes')::interval from metrics) end_time
                           from generate_series(0, (24 * 60), 60) n
        )
        select concat(m.site, '::', m.device, '::', m.name, '::', extract('epoch' from i.end_time))::varchar as key,
               m.site::varchar,
               m.device::varchar,
               m.name::varchar,
               i.end_time,
               percentile_disc(0.75) within group ( order by value)                                          as p75,
               percentile_disc(0.95) within group ( order by value)                                          as p95,
               percentile_disc(0.98) within group ( order by value)                                          as p98
        from metrics as m
                 right join intervals i
                            on m.created_at >= i.start_time and m.created_at < i.end_time
        where m.created_at >= lower_bound
          and m.created_at < upper_bound
          and value notnull
        group by i.start_time, i.end_time, m.site, m.name, m.device
        order by i.start_time;
end;
$$;
