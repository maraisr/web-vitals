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
