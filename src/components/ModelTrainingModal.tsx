import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Grid,
  Paper,
  LinearProgress,
  Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import ShowChartIcon from '@mui/icons-material/ShowChart';

interface ModelMetrics {
  model_performance: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
    class_metrics: {
      no_movement: {
        precision: number;
        recall: number;
        f1_score: number;
        support: number;
      };
      significant_movement: {
        precision: number;
        recall: number;
        f1_score: number;
        support: number;
      };
    };
    class_distribution: {
      no_movement: number;
      significant_movement: number;
    };
    confusion_matrix: {
      true_negative: number;
      false_positive: number;
      false_negative: number;
      true_positive: number;
    };
    top_features: Record<string, number>;
    training_samples: number;
    test_samples: number;
  };
  stock_performance: {
    [symbol: string]: {
      total_return: number;
      volatility: number;
      max_drawdown: number;
      avg_volume: number;
      data_points: number;
      date_range: {
        start: string;
        end: string;
      };
      current_price: number;
      significant_movements: number;
    };
  };
  training_info: {
    timeframe: string;
    prediction_window: number;
    movement_threshold: number;
    trained_symbols: string[];
  };
}

interface ModelTrainingModalProps {
  open: boolean;
  onClose: () => void;
  metrics: ModelMetrics | null;
  symbol: string;
}

const MetricCard: React.FC<{ title: string; value: number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <Paper 
    sx={{ 
      p: 2,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 1,
      background: (theme) => `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
    }}
  >
    {icon}
    <Typography variant="h6" align="center">
      {value.toFixed(1)}%
    </Typography>
    <Typography variant="body2" color="text.secondary" align="center">
      {title}
    </Typography>
  </Paper>
);

const ModelTrainingModal: React.FC<ModelTrainingModalProps> = ({
  open,
  onClose,
  metrics,
  symbol,
}) => {
  if (!metrics) return null;

  const stockMetrics = metrics.stock_performance[symbol];
  const modelMetrics = metrics.model_performance;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          background: (theme) => theme.palette.background.default,
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <CheckCircleIcon color="success" />
          <Typography variant="h6">
            Model Training Results: {symbol}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* Model Performance Metrics */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Model Performance
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <MetricCard
                  title="Accuracy"
                  value={modelMetrics.accuracy}
                  icon={<ShowChartIcon color="primary" sx={{ fontSize: 32 }} />}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <MetricCard
                  title="ROC AUC"
                  value={modelMetrics.roc_auc}
                  icon={<TimelineIcon color="primary" sx={{ fontSize: 32 }} />}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <MetricCard
                  title="F1 Score"
                  value={modelMetrics.f1_score}
                  icon={<BarChartIcon color="primary" sx={{ fontSize: 32 }} />}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Class Distribution */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Class Distribution
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Significant Movements: {modelMetrics.class_distribution.significant_movement}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={modelMetrics.class_distribution.significant_movement}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Stock Performance */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Stock Performance
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Return
                  </Typography>
                  <Typography variant="h6">
                    {stockMetrics.total_return.toFixed(2)}%
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Volatility
                  </Typography>
                  <Typography variant="h6">
                    {stockMetrics.volatility.toFixed(2)}%
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Max Drawdown
                  </Typography>
                  <Typography variant="h6">
                    {stockMetrics.max_drawdown.toFixed(2)}%
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Current Price
                  </Typography>
                  <Typography variant="h6">
                    ${stockMetrics.current_price.toFixed(2)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Training Details */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Training Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  Training Period: {stockMetrics.date_range.start} to {stockMetrics.date_range.end}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  Data Points: {stockMetrics.data_points.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2">
                  Samples: {modelMetrics.training_samples.toLocaleString()} training, {modelMetrics.test_samples.toLocaleString()} test
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          {/* Top Features */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Top Predictive Features
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {Object.entries(modelMetrics.top_features).map(([feature, importance]) => (
                <Chip
                  key={feature}
                  label={`${feature}: ${importance.toFixed(1)}%`}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModelTrainingModal; 