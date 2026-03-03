create table urls(
    id serial primary key,
    original_url text not null, 
    shortened_url varchar(10) unique not null, 
    created_at timestamp default now(), 
    created_by varchar(100),
    is_custom boolean default false, --this was added on later
    expires_at timestamp default null --added later
);

create table clicks(
    id serial primary key,
    short_url varchar(10) references urls(shortened_url),
    clicked_at timestamp default now(),
    referrer text, --where the url was cicked form, if put directly into browser then the value is null
    ip_addrr varchar(50),
    user_agent text --http header tells browser, device and os
);

-- psql -U postgres -d urlshortener -f db/schema.sq
-- psql being the command line tool and -U means user and postgres is a default superuser created when PostgreSQL
-- the -d urlshortener means database urlshortener

create table users(
    id serial primary key,
    username varchar(50) unique not null,
    password_hash text not null,
    created_at timestamp default now()
);