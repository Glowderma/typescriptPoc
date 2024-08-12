const queries: { [key: string]: string } = {
    addRecord: 'INSERT INTO users (name, email) VALUES($1, $2) RETURNING *',
};

export default queries;
