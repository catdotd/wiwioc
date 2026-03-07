--
-- PostgreSQL database dump
--

\restrict Qy74unZX07XRX52L6LsYCLBs8CmDFCZzPevqOvGw6XoSRAFCgm0WrLVtPspP85n

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2026-03-03 20:02:21

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 32776)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 5150 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 904 (class 1247 OID 32828)
-- Name: json_version_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.json_version_status AS ENUM (
    'Draft',
    'InReview',
    'Approved',
    'Rejected',
    'Published'
);


ALTER TYPE public.json_version_status OWNER TO postgres;

--
-- TOC entry 901 (class 1247 OID 32820)
-- Name: review_decision_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.review_decision_status AS ENUM (
    'Acknowledged',
    'Accepted',
    'Declined'
);


ALTER TYPE public.review_decision_status OWNER TO postgres;

--
-- TOC entry 898 (class 1247 OID 32815)
-- Name: review_request_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.review_request_status AS ENUM (
    'Pending',
    'Completed'
);


ALTER TYPE public.review_request_status OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 32850)
-- Name: app_user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.app_user (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username character varying(150) NOT NULL,
    password_hash text NOT NULL,
    role_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.app_user OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 32961)
-- Name: comment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comment (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    version_id uuid,
    text text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.comment OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 32870)
-- Name: json_template; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.json_template (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    owner_id uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


ALTER TABLE public.json_template OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 32885)
-- Name: json_version; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.json_version (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_id uuid NOT NULL,
    parent_version_id uuid,
    author_id uuid,
    status public.json_version_status DEFAULT 'Draft'::public.json_version_status NOT NULL,
    version_label character varying(100),
    json_content jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    approved_at timestamp without time zone,
    rejected_at timestamp without time zone,
    published_at timestamp without time zone
);


ALTER TABLE public.json_version OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 32938)
-- Name: review_decision; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.review_decision (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    request_id uuid NOT NULL,
    reviewer_id uuid,
    status public.review_decision_status NOT NULL,
    decided_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.review_decision OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 32916)
-- Name: review_request; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.review_request (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    version_id uuid NOT NULL,
    requester_id uuid,
    status public.review_request_status DEFAULT 'Pending'::public.review_request_status NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.review_request OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 32840)
-- Name: role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role (
    id integer NOT NULL,
    type character varying(50) NOT NULL
);


ALTER TABLE public.role OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 32839)
-- Name: role_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.role_id_seq OWNER TO postgres;

--
-- TOC entry 5151 (class 0 OID 0)
-- Dependencies: 220
-- Name: role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.role_id_seq OWNED BY public.role.id;


--
-- TOC entry 228 (class 1259 OID 32984)
-- Name: system_audit_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    action_type character varying(100) NOT NULL,
    target_id uuid,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.system_audit_log OWNER TO postgres;

--
-- TOC entry 4931 (class 2604 OID 32843)
-- Name: role id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role ALTER COLUMN id SET DEFAULT nextval('public.role_id_seq'::regclass);


--
-- TOC entry 5138 (class 0 OID 32850)
-- Dependencies: 222
-- Data for Name: app_user; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5143 (class 0 OID 32961)
-- Dependencies: 227
-- Data for Name: comment; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5139 (class 0 OID 32870)
-- Dependencies: 223
-- Data for Name: json_template; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5140 (class 0 OID 32885)
-- Dependencies: 224
-- Data for Name: json_version; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5142 (class 0 OID 32938)
-- Dependencies: 226
-- Data for Name: review_decision; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5141 (class 0 OID 32916)
-- Dependencies: 225
-- Data for Name: review_request; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5137 (class 0 OID 32840)
-- Dependencies: 221
-- Data for Name: role; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.role VALUES (1, 'Admin');
INSERT INTO public.role VALUES (2, 'Author');
INSERT INTO public.role VALUES (3, 'Reviewer');


--
-- TOC entry 5144 (class 0 OID 32984)
-- Dependencies: 228
-- Data for Name: system_audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5152 (class 0 OID 0)
-- Dependencies: 220
-- Name: role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.role_id_seq', 9, true);


--
-- TOC entry 4954 (class 2606 OID 32862)
-- Name: app_user app_user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT app_user_pkey PRIMARY KEY (id);


--
-- TOC entry 4956 (class 2606 OID 32864)
-- Name: app_user app_user_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT app_user_username_key UNIQUE (username);


--
-- TOC entry 4973 (class 2606 OID 32973)
-- Name: comment comment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_pkey PRIMARY KEY (id);


--
-- TOC entry 4959 (class 2606 OID 32879)
-- Name: json_template json_template_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.json_template
    ADD CONSTRAINT json_template_pkey PRIMARY KEY (id);


--
-- TOC entry 4963 (class 2606 OID 32900)
-- Name: json_version json_version_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.json_version
    ADD CONSTRAINT json_version_pkey PRIMARY KEY (id);


--
-- TOC entry 4969 (class 2606 OID 32948)
-- Name: review_decision review_decision_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_decision
    ADD CONSTRAINT review_decision_pkey PRIMARY KEY (id);


--
-- TOC entry 4966 (class 2606 OID 32927)
-- Name: review_request review_request_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_request
    ADD CONSTRAINT review_request_pkey PRIMARY KEY (id);


--
-- TOC entry 4950 (class 2606 OID 32847)
-- Name: role role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_pkey PRIMARY KEY (id);


--
-- TOC entry 4952 (class 2606 OID 32849)
-- Name: role role_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_type_key UNIQUE (type);


--
-- TOC entry 4976 (class 2606 OID 32993)
-- Name: system_audit_log system_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_audit_log
    ADD CONSTRAINT system_audit_log_pkey PRIMARY KEY (id);


--
-- TOC entry 4971 (class 2606 OID 32950)
-- Name: review_decision uq_review_decision_request_reviewer; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_decision
    ADD CONSTRAINT uq_review_decision_request_reviewer UNIQUE (request_id, reviewer_id);


--
-- TOC entry 4974 (class 1259 OID 33004)
-- Name: idx_comment_version; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comment_version ON public.comment USING btree (version_id);


--
-- TOC entry 4957 (class 1259 OID 32999)
-- Name: idx_json_template_owner; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_json_template_owner ON public.json_template USING btree (owner_id);


--
-- TOC entry 4960 (class 1259 OID 33001)
-- Name: idx_json_version_parent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_json_version_parent ON public.json_version USING btree (parent_version_id);


--
-- TOC entry 4961 (class 1259 OID 33000)
-- Name: idx_json_version_template; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_json_version_template ON public.json_version USING btree (template_id);


--
-- TOC entry 4967 (class 1259 OID 33003)
-- Name: idx_review_decision_request; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_review_decision_request ON public.review_decision USING btree (request_id);


--
-- TOC entry 4964 (class 1259 OID 33002)
-- Name: idx_review_request_version; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_review_request_version ON public.review_request USING btree (version_id);


--
-- TOC entry 4977 (class 2606 OID 32865)
-- Name: app_user app_user_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT app_user_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.role(id) ON DELETE SET NULL;


--
-- TOC entry 4986 (class 2606 OID 32974)
-- Name: comment comment_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_user(id) ON DELETE CASCADE;


--
-- TOC entry 4987 (class 2606 OID 32979)
-- Name: comment comment_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_version_id_fkey FOREIGN KEY (version_id) REFERENCES public.json_version(id) ON DELETE SET NULL;


--
-- TOC entry 4978 (class 2606 OID 32880)
-- Name: json_template json_template_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.json_template
    ADD CONSTRAINT json_template_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.app_user(id) ON DELETE SET NULL;


--
-- TOC entry 4979 (class 2606 OID 32911)
-- Name: json_version json_version_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.json_version
    ADD CONSTRAINT json_version_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.app_user(id) ON DELETE SET NULL;


--
-- TOC entry 4980 (class 2606 OID 32906)
-- Name: json_version json_version_parent_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.json_version
    ADD CONSTRAINT json_version_parent_version_id_fkey FOREIGN KEY (parent_version_id) REFERENCES public.json_version(id) ON DELETE SET NULL;


--
-- TOC entry 4981 (class 2606 OID 32901)
-- Name: json_version json_version_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.json_version
    ADD CONSTRAINT json_version_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.json_template(id) ON DELETE CASCADE;


--
-- TOC entry 4984 (class 2606 OID 32951)
-- Name: review_decision review_decision_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_decision
    ADD CONSTRAINT review_decision_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.review_request(id) ON DELETE CASCADE;


--
-- TOC entry 4985 (class 2606 OID 32956)
-- Name: review_decision review_decision_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_decision
    ADD CONSTRAINT review_decision_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.app_user(id) ON DELETE SET NULL;


--
-- TOC entry 4982 (class 2606 OID 32933)
-- Name: review_request review_request_requester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_request
    ADD CONSTRAINT review_request_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.app_user(id) ON DELETE SET NULL;


--
-- TOC entry 4983 (class 2606 OID 32928)
-- Name: review_request review_request_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_request
    ADD CONSTRAINT review_request_version_id_fkey FOREIGN KEY (version_id) REFERENCES public.json_version(id) ON DELETE CASCADE;


--
-- TOC entry 4988 (class 2606 OID 32994)
-- Name: system_audit_log system_audit_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_audit_log
    ADD CONSTRAINT system_audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_user(id) ON DELETE SET NULL;


-- Completed on 2026-03-03 20:02:21

--
-- PostgreSQL database dump complete
--

\unrestrict Qy74unZX07XRX52L6LsYCLBs8CmDFCZzPevqOvGw6XoSRAFCgm0WrLVtPspP85n

