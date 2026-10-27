import React from 'react';
import { X, BookOpen, Cpu, GitBranch, Repeat, Compass, CheckCircle2, ShieldCheck } from 'lucide-react';

interface AcademicConceptsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AcademicConceptsModal: React.FC<AcademicConceptsModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-navy-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              FraudGraph — Academic DSA Dossier for Judges
            </h2>
            <p className="text-xs text-slate-400">
              Data Structures, Graph Algorithm Mechanics, Invariant Guarantees & Complexity Proofs
            </p>
          </div>
        </div>

        <div className="space-y-6 text-xs text-slate-300">
          {/* 1. DATA STRUCTURE: ADJACENCY LIST */}
          <section className="p-4 rounded-xl bg-navy-950/70 border border-slate-800">
            <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4" />
              1. Directed Graph Representation: Adjacency List
            </h3>
            <p className="leading-relaxed mb-3">
              Financial transaction networks are inherently <strong>sparse</strong> graphs, where the number of directed transfers |E| is typically much smaller than |V|². We use an Adjacency List implemented with fast hash maps:
            </p>
            <div className="p-3 bg-navy-900 rounded-lg font-mono text-[11px] text-cyan-300 border border-slate-800/80 mb-3">
              std::unordered_map&lt;std::string, std::vector&lt;Transaction&gt;&gt; adj_; &nbsp;// Outgoing edges<br />
              std::unordered_map&lt;std::string, std::vector&lt;Transaction&gt;&gt; rev_adj_; // Incoming edges
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li><strong>Space Complexity:</strong> O(|V| + |E|), vastly superior to an Adjacency Matrix which requires O(|V|²) memory.</li>
              <li><strong>Edge Iteration:</strong> O(deg⁺(u)) where deg⁺(u) is the out-degree of account u.</li>
              <li><strong>Determinism:</strong> Outgoing edges are deterministically sorted by destination account ID and transaction ID to guarantee reproducible traversal sequences across runs.</li>
            </ul>
          </section>

          {/* 2. BFS: LEVEL-ORDER TRAVERSAL & SHORTEST PATH */}
          <section className="p-4 rounded-xl bg-navy-950/70 border border-slate-800">
            <h3 className="text-sm font-bold text-teal-400 flex items-center gap-2 mb-2">
              <Compass className="w-4 h-4" />
              2. Breadth-First Search (BFS) & Shortest Path Reconstruction
            </h3>
            <p className="leading-relaxed mb-2">
              BFS explores the transaction graph radially level-by-level using a FIFO queue (<code className="text-teal-300 font-mono">std::queue&lt;std::string&gt;</code>).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2 font-mono text-[11px]">
              <div className="p-2.5 rounded bg-navy-900 border border-slate-800">
                <span className="text-teal-400 font-bold block mb-1">Queue Invariant</span>
                Nodes at distance <em>d</em> are dequeued and processed strictly before any node at distance <em>d + 1</em>.
              </div>
              <div className="p-2.5 rounded bg-navy-900 border border-slate-800">
                <span className="text-teal-400 font-bold block mb-1">Predecessor Backtracking</span>
                <code className="text-slate-300">pred[v] = &#123;u, tx&#125;</code> stores the exact upstream edge. Path is reconstructed in O(P) time from destination back to source.
              </div>
            </div>
            <p className="text-slate-400">
              <strong>Guarantees:</strong> Yields the absolute minimum hop count in an unweighted directed graph in O(|V| + |E|) time and O(|V|) space.
            </p>
          </section>

          {/* 3. DFS: DISCOVERY/FINISH INTERVALS */}
          <section className="p-4 rounded-xl bg-navy-950/70 border border-slate-800">
            <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2 mb-2">
              <GitBranch className="w-4 h-4" />
              3. Depth-First Search (DFS) & Parenthesis Theorem
            </h3>
            <p className="leading-relaxed mb-2">
              DFS penetrates deeply along directed branches before backtracking via recursion. A global step counter increments at each entry and exit, establishing exact discovery times <code className="text-purple-300 font-mono">d[u]</code> and finish times <code className="text-purple-300 font-mono">f[u]</code>.
            </p>
            <div className="p-3 bg-navy-900 rounded-lg text-slate-300 border border-slate-800 mb-2">
              <strong>The Parenthesis Theorem:</strong> For any two vertices <em>u</em> and <em>v</em>, exactly one of the following holds:
              <ol className="list-decimal list-inside mt-1 space-y-0.5 text-slate-400 text-[11px]">
                <li>Intervals [d[u], f[u]] and [d[v], f[v]] are entirely disjoint (neither is an ancestor of the other in the DFS forest).</li>
                <li>Interval [d[v], f[v]] is entirely contained within [d[u], f[u]], proving that <em>v</em> is a descendant of <em>u</em> in the DFS tree.</li>
              </ol>
            </div>
          </section>

          {/* 4. DIRECTED CYCLE DETECTION: 3-STATE DFS */}
          <section className="p-4 rounded-xl bg-navy-950/70 border border-slate-800">
            <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2 mb-2">
              <Repeat className="w-4 h-4" />
              4. Directed Cycle Detection via Three-State DFS (WHITE/GRAY/BLACK)
            </h3>
            <p className="leading-relaxed mb-2">
              Standard boolean visited tracking fails in directed graphs because reaching an already-visited vertex through a cross-edge or forward-edge does <em>not</em> imply a cycle. We implement the formal 3-color scheme:
            </p>
            <div className="grid grid-cols-3 gap-2 mb-3 font-mono text-[11px] text-center">
              <div className="p-2 rounded bg-slate-900 border border-slate-700">
                <span className="text-slate-200 font-bold block">WHITE (0)</span>
                Unvisited node
              </div>
              <div className="p-2 rounded bg-amber-950/60 border border-amber-600/40">
                <span className="text-amber-300 font-bold block">GRAY (1)</span>
                Active on Call Stack
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-700">
                <span className="text-slate-400 font-bold block">BLACK (2)</span>
                Subtree Fully Explored
              </div>
            </div>
            <div className="p-3 bg-navy-900 rounded-lg text-slate-300 border border-slate-800">
              <strong>Cycle Theorem:</strong> A directed graph contains a directed cycle if and only if a DFS traversal yields at least one <strong>back-edge</strong>: an edge <code className="text-rose-300 font-mono">(u, v)</code> where vertex <em>v</em> is currently <strong>GRAY</strong>.
              <p className="mt-1 text-slate-400 text-[11px]">
                The exact cycle is reconstructed by tracing the current path stack from <em>v</em> to <em>u</em> and closing back at <em>v</em>.
              </p>
            </div>
          </section>

          {/* 5. INTEGER MONETARY ARITHMETIC (PAISE) */}
          <section className="p-4 rounded-xl bg-navy-950/70 border border-slate-800">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4" />
              5. Financial Precision: Integer Monetary Units (Paise)
            </h3>
            <p className="leading-relaxed mb-2">
              Standard IEEE-754 floating-point types (<code className="text-emerald-300 font-mono">float</code>, <code className="text-emerald-300 font-mono">double</code>) introduce binary rounding drift (e.g. 0.1 + 0.2 = 0.30000000000000004). In financial systems, rounding error violates reconciliation audits.
            </p>
            <p className="text-slate-400">
              The C++ engine strictly stores all values in <code className="text-emerald-300 font-mono">int64_t amount_paise</code> (1 INR = 100 paise). All additions, subtractions, and net discrepancy calculations are performed in exact integer arithmetic. Conversions to fractional INR are performed solely at the UI boundary.
            </p>
          </section>

          {/* 6. BIG-O COMPLEXITY SUMMARY TABLE */}
          <section className="p-4 rounded-xl bg-navy-950/70 border border-slate-800">
            <h3 className="text-sm font-bold text-slate-100 mb-3">
              6. Formal Asymptotic Complexity Summary
            </h3>
            <div className="overflow-x-auto rounded-lg border border-slate-800 font-mono text-[11px]">
              <table className="w-full text-left">
                <thead className="bg-navy-900 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Algorithm / Operation</th>
                    <th className="p-2.5">Time Complexity</th>
                    <th className="p-2.5">Space Complexity</th>
                    <th className="p-2.5">Core Mechanism</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="p-2 font-bold text-cyan-300">Graph Construction</td>
                    <td className="p-2">O(|V| + |E|)</td>
                    <td className="p-2">O(|V| + |E|)</td>
                    <td className="p-2 text-slate-400">Hash map adjacency list insertion</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-emerald-300">Breadth-First Search (BFS)</td>
                    <td className="p-2">O(|V| + |E|)</td>
                    <td className="p-2">O(|V|)</td>
                    <td className="p-2 text-slate-400">FIFO Queue &amp; Visited Set</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-purple-300">Depth-First Search (DFS)</td>
                    <td className="p-2">O(|V| + |E|)</td>
                    <td className="p-2">O(|V|)</td>
                    <td className="p-2 text-slate-400">Recursion stack &amp; Timers</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-rose-300">Cycle Detection</td>
                    <td className="p-2">O(|V| + |E|)</td>
                    <td className="p-2">O(|V|)</td>
                    <td className="p-2 text-slate-400">Three-State DFS (WHITE/GRAY/BLACK)</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-teal-300">Shortest Path</td>
                    <td className="p-2">O(|V| + |E|)</td>
                    <td className="p-2">O(|V|)</td>
                    <td className="p-2 text-slate-400">BFS Predecessor Map Backtracking</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-amber-300">Rule-Based Audit</td>
                    <td className="p-2">O(|V| + |E|)</td>
                    <td className="p-2">O(|V|)</td>
                    <td className="p-2 text-slate-400">Degree &amp; Inflow/Outflow verification</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
