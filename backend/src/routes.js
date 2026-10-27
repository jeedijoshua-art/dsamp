const express = require('express');
const { runEngine, ENGINE_BIN } = require('./engineBridge');
const { getSampleDataset, getPrebuiltDatasets, getDatasetById } = require('./sampleData');
const fs = require('fs');

const router = express.Router();

// In-memory working dataset store (initialized with sample data, can be modified by user or reset)
let activeDatasetId = 'fraud_investigation';
let currentDataset = getSampleDataset();

// 1. Health check & C++ engine status
router.get('/health', (req, res) => {
  const binaryExists = fs.existsSync(ENGINE_BIN);
  res.json({
    status: 'ok',
    service: 'FraudGraph API Bridge',
    engine_binary_present: binaryExists,
    engine_binary_path: ENGINE_BIN,
    timestamp: new Date().toISOString()
  });
});

// 2. Fetch sample dataset (backward compatibility)
router.get('/sample-data', (req, res) => {
  res.json(getSampleDataset());
});

// 3. Prebuilt Datasets Catalog
router.get('/datasets', (req, res) => {
  res.json({
    status: 'success',
    active_dataset_id: activeDatasetId,
    datasets: getPrebuiltDatasets()
  });
});

// 4. Select / Switch Active Dataset
router.post('/datasets/select', (req, res) => {
  const { dataset_id } = req.body;
  if (!dataset_id) {
    return res.status(400).json({ status: 'error', error: 'dataset_id is required' });
  }

  const ds = getDatasetById(dataset_id);
  activeDatasetId = ds.id;
  currentDataset = {
    metadata: {
      dataset_id: ds.id,
      dataset_label: ds.title,
      description: ds.description,
      currency: 'INR (Indian Rupee)',
      unit: 'Paise (1 INR = 100 Paise)'
    },
    accounts: JSON.parse(JSON.stringify(ds.accounts)),
    transactions: JSON.parse(JSON.stringify(ds.transactions)),
    default_algorithm: ds.default_algorithm,
    default_source: ds.default_source,
    default_destination: ds.default_destination,
    default_bfs_start: ds.default_bfs_start,
    default_dfs_start: ds.default_dfs_start
  };

  res.json({
    status: 'success',
    message: `Active dataset switched to '${ds.title}'.`,
    active_dataset_id: activeDatasetId,
    dataset: currentDataset
  });
});

// 5. Reset dataset back to initial deterministic sample or active dataset
router.post('/reset', (req, res) => {
  const targetId = req.body?.dataset_id || activeDatasetId || 'fraud_investigation';
  const ds = getDatasetById(targetId);
  activeDatasetId = ds.id;
  currentDataset = {
    metadata: {
      dataset_id: ds.id,
      dataset_label: ds.title,
      description: ds.description,
      currency: 'INR (Indian Rupee)',
      unit: 'Paise (1 INR = 100 Paise)'
    },
    accounts: JSON.parse(JSON.stringify(ds.accounts)),
    transactions: JSON.parse(JSON.stringify(ds.transactions)),
    default_algorithm: ds.default_algorithm,
    default_source: ds.default_source,
    default_destination: ds.default_destination,
    default_bfs_start: ds.default_bfs_start,
    default_dfs_start: ds.default_dfs_start
  };

  res.json({
    status: 'success',
    message: `Dataset successfully reset to '${ds.title}' benchmark standard.`,
    active_dataset_id: activeDatasetId,
    dataset: currentDataset
  });
});

// 6. Retrieve current active dataset
router.get('/dataset', (req, res) => {
  res.json({
    status: 'success',
    active_dataset_id: activeDatasetId,
    dataset: currentDataset
  });
});

// 5. Add account to active dataset
router.post('/accounts', async (req, res) => {
  const { id, name, type, risk_tier } = req.body;
  if (!id || typeof id !== 'string' || !id.trim()) {
    return res.status(400).json({ status: 'error', error: 'Valid Account ID is required.' });
  }

  const cleanId = id.trim().toUpperCase();
  const exists = currentDataset.accounts.some(a => a.id === cleanId);
  if (exists) {
    return res.status(400).json({ status: 'error', error: `Account '${cleanId}' already exists.` });
  }

  const newAcc = {
    id: cleanId,
    name: name?.trim() || `Account ${cleanId}`,
    type: type?.trim() || 'Standard',
    risk_tier: risk_tier || 'LOW',
    created_at: new Date().toISOString()
  };

  currentDataset.accounts.push(newAcc);
  res.json({
    status: 'success',
    message: `Account '${cleanId}' added successfully.`,
    account: newAcc,
    dataset: currentDataset
  });
});

// 6. Add directed transaction to active dataset
router.post('/transactions', async (req, res) => {
  const { id, from_account, to_account, amount, amount_paise, memo } = req.body;

  if (!id || typeof id !== 'string' || !id.trim()) {
    return res.status(400).json({ status: 'error', error: 'Valid Transaction ID is required.' });
  }
  if (!from_account || !to_account) {
    return res.status(400).json({ status: 'error', error: 'Both source and destination accounts are required.' });
  }

  const cleanId = id.trim().toUpperCase();
  const cleanFrom = from_account.trim().toUpperCase();
  const cleanTo = to_account.trim().toUpperCase();

  const txExists = currentDataset.transactions.some(t => t.id === cleanId);
  if (txExists) {
    return res.status(400).json({ status: 'error', error: `Transaction ID '${cleanId}' already exists.` });
  }

  // Calculate integer paise
  let paise = 0;
  if (amount_paise !== undefined && amount_paise !== null) {
    paise = parseInt(amount_paise, 10);
  } else if (amount !== undefined && amount !== null) {
    paise = Math.round(parseFloat(amount) * 100);
  } else {
    return res.status(400).json({ status: 'error', error: 'Transaction amount is required.' });
  }

  if (isNaN(paise) || paise <= 0) {
    return res.status(400).json({ status: 'error', error: 'Transaction amount must be greater than zero.' });
  }

  // Ensure accounts exist in dataset (reject missing accounts, do not silently create them)
  if (!currentDataset.accounts.some(a => a.id === cleanFrom)) {
    return res.status(400).json({ status: 'error', error: `Source account '${cleanFrom}' does not exist.` });
  }
  if (!currentDataset.accounts.some(a => a.id === cleanTo)) {
    return res.status(400).json({ status: 'error', error: `Destination account '${cleanTo}' does not exist.` });
  }

  const newTx = {
    id: cleanId,
    from_account: cleanFrom,
    to_account: cleanTo,
    amount_paise: paise,
    timestamp: new Date().toISOString(),
    memo: memo?.trim() || ''
  };

  currentDataset.transactions.push(newTx);
  res.json({
    status: 'success',
    message: `Transaction '${cleanId}' successfully recorded.`,
    transaction: newTx,
    dataset: currentDataset
  });
});

// 7. Delete account and its incident transactions
router.delete('/accounts/:id', (req, res) => {
  const accountId = req.params.id?.trim().toUpperCase();
  if (!accountId) {
    return res.status(400).json({ status: 'error', error: 'Account ID is required.' });
  }

  const initialCount = currentDataset.accounts.length;
  currentDataset.accounts = currentDataset.accounts.filter(a => a.id !== accountId);

  if (currentDataset.accounts.length === initialCount) {
    return res.status(404).json({ status: 'error', error: `Account '${accountId}' not found.` });
  }

  // Cascade delete incident transactions
  currentDataset.transactions = currentDataset.transactions.filter(
    t => t.from_account !== accountId && t.to_account !== accountId
  );

  res.json({
    status: 'success',
    message: `Account '${accountId}' and its incident transactions removed.`,
    dataset: currentDataset
  });
});

// 8. Delete transaction
router.delete('/transactions/:id', (req, res) => {
  const txId = req.params.id?.trim().toUpperCase();
  if (!txId) {
    return res.status(400).json({ status: 'error', error: 'Transaction ID is required.' });
  }

  const initialCount = currentDataset.transactions.length;
  currentDataset.transactions = currentDataset.transactions.filter(t => t.id !== txId);

  if (currentDataset.transactions.length === initialCount) {
    return res.status(404).json({ status: 'error', error: `Transaction '${txId}' not found.` });
  }

  res.json({
    status: 'success',
    message: `Transaction '${txId}' removed.`,
    dataset: currentDataset
  });
});

// 9. Reset custom graph endpoint
router.post('/custom/reset', (req, res) => {
  res.json({
    status: 'success',
    message: 'Custom graph reset to blank canvas.',
    dataset: {
      accounts: [],
      transactions: []
    }
  });
});

// 10. General engine execution endpoint (stateless snapshot to C++17 engine)
router.post('/execute', async (req, res) => {
  try {
    const payload = {
      accounts: Array.isArray(req.body.accounts) ? req.body.accounts : currentDataset.accounts,
      transactions: Array.isArray(req.body.transactions) ? req.body.transactions : currentDataset.transactions,
      action: req.body.action || 'full_analysis',
      params: req.body.params || {}
    };

    const engineResult = await runEngine(payload);
    res.json(engineResult);
  } catch (err) {
    console.error('[FraudGraph Error]:', err.message);
    res.status(500).json({
      status: 'error',
      error: err.message
    });
  }
});

module.exports = router;
